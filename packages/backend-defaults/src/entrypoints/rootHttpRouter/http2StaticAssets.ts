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

import type { RootHttpRouterService } from '@backstage/backend-plugin-api';
import type { HttpServerHttp2StaticAssetsOptions } from './http/types';

type StaticAssetsAdder = (assets: HttpServerHttp2StaticAssetsOptions) => void;

// Links HTTP servers and root HTTP routers to the HTTP/2 server that serves
// their static assets. Weak references, so that nothing is kept alive.
const adders = new WeakMap<object, StaticAssetsAdder>();

/** @internal */
export function setHttp2StaticAssetsAdder(
  target: object,
  adder: StaticAssetsAdder,
) {
  adders.set(target, adder);
}

/** @internal */
export function getHttp2StaticAssetsAdder(
  target: object,
): StaticAssetsAdder | undefined {
  return adders.get(target);
}

/**
 * Adds a directory of static files for the built-in HTTP/2 server to serve
 * directly, in the same way as the `backend.http2.staticAssets` config.
 *
 * @remarks
 *
 * The files must also be served by a route registered with the root HTTP
 * router, since the first request for each file is forwarded to the backend
 * to learn which caching headers to use. Files are served without any backend
 * middleware, so only use this for public files.
 *
 * Does nothing if the backend isn't serving HTTP/2, which is enabled with
 * `backend.http2`, or if the root HTTP router isn't the default
 * implementation.
 *
 * @alpha
 * @returns Whether the directory was added.
 */
export function addHttp2StaticAssets(
  rootHttpRouter: RootHttpRouterService,
  assets: {
    /** The URL path that the files are served under. */
    path: string;
    /** The directory that the files are read from. */
    directory: string;
  },
): boolean {
  const adder = adders.get(rootHttpRouter);
  if (!adder) {
    return false;
  }
  adder(assets);
  return true;
}
