/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'node:fs';
import type * as http from 'node:http';
import type * as http2 from 'node:http2';
import { extname, isAbsolute, join, relative } from 'node:path';
import { pipeline } from 'node:stream';
import { createGzip } from 'node:zlib';
import { HttpServerHttp2StaticAssetsOptions } from './types';

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
};

const COMPRESSIBLE_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.mjs',
  '.json',
  '.map',
  '.txt',
  '.svg',
]);

// Smaller files are not worth the compression overhead
const MIN_COMPRESS_SIZE = 1024;

/**
 * The caching headers that the backend sent for a static asset, keyed by file
 * path. The ETag identifies the version of the file that they apply to.
 */
export type StaticAssetCache = Map<
  string,
  { etag: string; cacheControl?: string }
>;

type Request = http.IncomingMessage | http2.Http2ServerRequest;
type Response = http.ServerResponse | http2.Http2ServerResponse;

// Both response types support the same writeHead call, but TypeScript can't
// call a method on a union of overloaded signatures.
function writeHead(
  res: Response,
  statusCode: number,
  headers: http.OutgoingHttpHeaders,
) {
  (res as http.ServerResponse).writeHead(statusCode, headers);
}

/**
 * Resolves a request to a file inside one of the static asset directories.
 * Returns undefined if the request is not for a static asset, or if the path
 * is unsafe, so that the request can be forwarded to Express instead.
 */
export function resolveStaticAssetPath(
  url: string | undefined,
  mounts: HttpServerHttp2StaticAssetsOptions[],
): { filePath: string; mount: HttpServerHttp2StaticAssetsOptions } | undefined {
  if (!url) {
    return undefined;
  }
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  } catch {
    return undefined;
  }

  for (const mount of mounts) {
    if (!pathname.startsWith(`${mount.path}/`)) {
      continue;
    }
    const subPath = pathname.slice(mount.path.length + 1);
    // Reject empty, relative and hidden segments, as well as null bytes
    const segments = subPath.split(/[/\\]/);
    if (
      subPath.includes('\0') ||
      segments.some(segment => segment === '' || segment.startsWith('.'))
    ) {
      return undefined;
    }
    const filePath = join(mount.directory, ...segments);
    const relativePath = relative(mount.directory, filePath);
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      return undefined;
    }
    return { filePath, mount };
  }
  return undefined;
}

/**
 * Records the caching headers of a static asset response from the backend,
 * so that later requests for the same version of the file can be served
 * directly with the same headers.
 */
export function learnStaticAsset(
  req: Request,
  backendResponse: http.IncomingMessage,
  mounts: HttpServerHttp2StaticAssetsOptions[],
  cache: StaticAssetCache,
) {
  if (mounts.length === 0 || (req.method !== 'GET' && req.method !== 'HEAD')) {
    return;
  }
  const { statusCode, headers } = backendResponse;
  if (statusCode !== 200 && statusCode !== 304) {
    return;
  }
  const resolved = resolveStaticAssetPath(req.url, mounts);
  if (!resolved || typeof headers.etag !== 'string') {
    return;
  }
  cache.set(resolved.filePath, {
    etag: headers.etag,
    cacheControl: headers['cache-control'],
  });
}

/**
 * Serves a GET or HEAD request from one of the static asset directories.
 * Resolves to false if the request was not handled and should be forwarded
 * to Express instead, for example because the file does not exist, or
 * because the backend hasn't served this version of the file yet.
 */
export async function serveStaticAsset(
  req: Request,
  res: Response,
  mounts: HttpServerHttp2StaticAssetsOptions[],
  cache: StaticAssetCache,
): Promise<boolean> {
  if (mounts.length === 0 || (req.method !== 'GET' && req.method !== 'HEAD')) {
    return false;
  }
  const resolved = resolveStaticAssetPath(req.url, mounts);
  if (!resolved) {
    return false;
  }
  const { filePath } = resolved;

  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    return false;
  }
  if (!stat.isFile()) {
    return false;
  }

  // Same format as the ETag that Express generates for static files. Only
  // serve the file if the backend has served this exact version before, so
  // that the response gets the same caching headers as the backend uses.
  const etag = `W/"${stat.size.toString(16)}-${stat.mtime
    .getTime()
    .toString(16)}"`;
  const known = cache.get(filePath);
  if (known?.etag !== etag) {
    return false;
  }

  const ext = extname(filePath).toLowerCase();
  const headers: Record<string, string | number> = {
    etag,
    'last-modified': stat.mtime.toUTCString(),
    'x-content-type-options': 'nosniff',
    vary: 'accept-encoding',
  };
  if (known.cacheControl) {
    headers['cache-control'] = known.cacheControl;
  }

  const ifNoneMatch = req.headers['if-none-match'];
  if (
    ifNoneMatch &&
    ifNoneMatch.split(',').some(tag => {
      const trimmed = tag.trim();
      return trimmed === '*' || trimmed === etag;
    })
  ) {
    writeHead(res, 304, headers);
    res.end();
    return true;
  }

  headers['content-type'] = CONTENT_TYPES[ext] ?? 'application/octet-stream';

  const acceptEncoding = req.headers['accept-encoding'];
  const gzip =
    COMPRESSIBLE_EXTENSIONS.has(ext) &&
    stat.size >= MIN_COMPRESS_SIZE &&
    typeof acceptEncoding === 'string' &&
    /\bgzip\b/.test(acceptEncoding);
  if (gzip) {
    headers['content-encoding'] = 'gzip';
  } else {
    headers['content-length'] = stat.size;
  }

  writeHead(res, 200, headers);
  if (req.method === 'HEAD') {
    res.end();
    return true;
  }

  const onError = (error: NodeJS.ErrnoException | null) => {
    if (error) {
      res.destroy();
    }
  };
  const fileStream = fs.createReadStream(filePath);
  if (gzip) {
    pipeline(fileStream, createGzip(), res as NodeJS.WritableStream, onError);
  } else {
    pipeline(fileStream, res as NodeJS.WritableStream, onError);
  }
  return true;
}
