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

import {
  createMockDirectory,
  mockServices,
} from '@backstage/backend-test-utils';
import express from 'express';
import * as http2 from 'node:http2';
import * as https from 'node:https';
import { gunzipSync } from 'node:zlib';
import { createHttp2Server } from './createHttp2Server';
import { ExtendedHttpServer } from './types';

const generateCredentials = () =>
  new Promise<{ key: string; cert: string }>((resolve, reject) =>
    require('selfsigned').generate(
      [{ name: 'commonName', value: 'localhost' }],
      { days: 1, keySize: 2048 },
      (err: Error, bundle: { private: string; cert: string }) =>
        err ? reject(err) : resolve({ key: bundle.private, cert: bundle.cert }),
    ),
  );

type Http2Response = {
  status: number;
  headers: http2.IncomingHttpHeaders;
  body: Buffer;
};

function http2Request(
  client: http2.ClientHttp2Session,
  headers: http2.OutgoingHttpHeaders,
): Promise<Http2Response> {
  return new Promise((resolve, reject) => {
    const req = client.request(headers);
    const chunks: Buffer[] = [];
    let responseHeaders: http2.IncomingHttpHeaders = {};
    req.on('response', h => {
      responseHeaders = h;
    });
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () =>
      resolve({
        status: Number(responseHeaders[':status']),
        headers: responseHeaders,
        body: Buffer.concat(chunks),
      }),
    );
    req.on('error', reject);
    req.end();
  });
}

describe('createHttp2Server', () => {
  const mockDir = createMockDirectory();
  const logger = mockServices.logger.mock();
  let credentials: { key: string; cert: string };
  let server: ExtendedHttpServer | undefined;

  beforeAll(async () => {
    credentials = await generateCredentials();
  });

  afterEach(async () => {
    await server?.stop();
    server = undefined;
  });

  let longPollClosed: (reason: string) => void;

  function createApp(staticDirectory?: string) {
    const app = express();
    app.set('trust proxy', 1);
    if (staticDirectory) {
      // Like the app backend, which revalidates the file with injected config
      app.use(
        '/static',
        express.static(staticDirectory, {
          setHeaders: (res, path) => {
            res.setHeader(
              'Cache-Control',
              path.endsWith('injected.js')
                ? 'no-cache'
                : 'public, max-age=1209600',
            );
          },
        }),
      );
    }
    app.get('/api/echo', (req, res) => {
      res.json({
        ip: req.ip,
        protocol: req.protocol,
        httpVersion: req.httpVersion,
        forwardedFor: req.headers['x-forwarded-for'],
        socketAddress: req.socket.remoteAddress ?? null,
      });
    });
    app.get('/api/long-poll', (_req, res) => {
      // Like the events bus, send the status right away and keep the body open
      res.status(202);
      res.flushHeaders();
      const timeout = setTimeout(() => res.end(), 2000);
      res.once('close', () => {
        clearTimeout(timeout);
        longPollClosed(res.writableFinished ? 'finished' : 'aborted');
      });
    });
    app.use((req, res) => {
      res.status(404).json({ fromBackend: true, url: req.url });
    });
    return app;
  }

  async function startServer(staticDirectory?: string) {
    server = await createHttp2Server(
      createApp(staticDirectory),
      {
        listen: { host: '127.0.0.1', port: 0 },
        credentials,
        http2: {
          staticAssets: staticDirectory
            ? [{ path: '/static', directory: staticDirectory }]
            : [],
        },
      },
      { logger },
    );
    await server.start();
    return server.port();
  }

  it('forwards HTTP/2 and HTTP/1.1 requests to the backend', async () => {
    const port = await startServer();
    const client = http2.connect(`https://localhost:${port}`, {
      ca: credentials.cert,
    });

    const res = await http2Request(client, {
      ':path': '/api/echo',
      'x-forwarded-for': '6.6.6.6',
      'x-forwarded-proto': 'http',
    });
    expect(res.status).toBe(200);
    // The spoofed forwarding headers are replaced with the real client
    expect(JSON.parse(res.body.toString())).toEqual({
      ip: '127.0.0.1',
      protocol: 'https',
      httpVersion: '1.1',
      forwardedFor: '127.0.0.1',
      // The backend listens on a local socket, which has no IP address
      socketAddress: null,
    });
    // Headers of streamed responses are sent before the body ends, and the
    // backend request is stopped when the client cancels it
    const longPollResult = new Promise<string>(resolve => {
      longPollClosed = resolve;
    });
    const longPoll = client.request({ ':path': '/api/long-poll' });
    const status = await new Promise(resolve => {
      const timeout = setTimeout(() => resolve('timeout'), 1000);
      longPoll.once('response', headers => {
        clearTimeout(timeout);
        resolve(headers[':status']);
      });
    });
    expect(status).toBe(202);
    longPoll.close();
    await expect(longPollResult).resolves.toBe('aborted');

    client.close();

    const http1Body = await new Promise<string>((resolve, reject) => {
      https
        .get(`https://localhost:${port}/api/echo`, { ca: credentials.cert })
        .on('response', r => {
          let body = '';
          r.on('data', chunk => (body += chunk));
          r.on('end', () => resolve(body));
        })
        .on('error', reject);
    });
    expect(JSON.parse(http1Body)).toMatchObject({
      ip: '127.0.0.1',
      protocol: 'https',
    });
  });

  it('serves static assets directly with the caching headers of the backend', async () => {
    const mainJs = `console.log("${'x'.repeat(2000)}");`;
    mockDir.setContent({
      'dist/static/main.js': mainJs,
      'dist/static/injected.js': 'config',
      'dist/static/.hidden': 'secret',
      'dist/secret.txt': 'secret',
    });
    const port = await startServer(mockDir.resolve('dist/static'));
    const client = http2.connect(`https://localhost:${port}`, {
      ca: credentials.cert,
    });

    // The first request is served by the backend, later ones directly
    const fromBackend = await http2Request(client, {
      ':path': '/static/main.js',
    });
    expect(fromBackend.status).toBe(200);
    expect(fromBackend.headers['x-powered-by']).toBe('Express');
    expect(fromBackend.body.toString()).toBe(mainJs);

    const direct = await http2Request(client, { ':path': '/static/main.js' });
    expect(direct.status).toBe(200);
    expect(direct.headers['x-powered-by']).toBeUndefined();
    expect(direct.headers['content-type']).toBe(
      'text/javascript; charset=utf-8',
    );
    expect(direct.headers['content-encoding']).toBeUndefined();
    expect(direct.body.toString()).toBe(mainJs);
    for (const header of ['cache-control', 'etag', 'last-modified']) {
      expect(direct.headers[header]).toBe(fromBackend.headers[header]);
    }
    expect(direct.headers['cache-control']).toBe('public, max-age=1209600');

    const notModified = await http2Request(client, {
      ':path': '/static/main.js',
      'if-none-match': direct.headers.etag as string,
    });
    expect(notModified.status).toBe(304);
    expect(notModified.headers['x-powered-by']).toBeUndefined();
    expect(notModified.body.length).toBe(0);

    const gzipped = await http2Request(client, {
      ':path': '/static/main.js',
      'accept-encoding': 'gzip, br',
    });
    expect(gzipped.headers['content-encoding']).toBe('gzip');
    expect(gunzipSync(gzipped.body).toString()).toBe(mainJs);

    // Files that the backend revalidates are also revalidated when direct
    await http2Request(client, { ':path': '/static/injected.js' });
    const injected = await http2Request(client, {
      ':path': '/static/injected.js',
    });
    expect(injected.headers['x-powered-by']).toBeUndefined();
    expect(injected.headers['cache-control']).toBe('no-cache');

    // A changed file is served by the backend again
    mockDir.addContent({ 'dist/static/main.js': 'changed' });
    const changed = await http2Request(client, { ':path': '/static/main.js' });
    expect(changed.headers['x-powered-by']).toBe('Express');
    expect(changed.body.toString()).toBe('changed');

    // Missing, hidden and escaping paths are left to the backend
    for (const path of [
      '/static/missing.js',
      '/static/.hidden',
      '/static/%2e%2e/secret.txt',
      '/static/..%2fsecret.txt',
    ]) {
      const forwarded = await http2Request(client, { ':path': path });
      expect(forwarded.status).toBe(404);
      expect(forwarded.headers['x-powered-by']).toBe('Express');
    }

    client.close();
  });

  it('does not serve static assets of an app with a protected entry point', async () => {
    mockDir.setContent({
      'dist/static/main.js': 'protected',
      'dist/public/static/main.js': 'public',
    });
    const port = await startServer(mockDir.resolve('dist/static'));
    const client = http2.connect(`https://localhost:${port}`, {
      ca: credentials.cert,
    });

    for (let i = 0; i < 2; i++) {
      const res = await http2Request(client, { ':path': '/static/main.js' });
      expect(res.headers['x-powered-by']).toBe('Express');
    }
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('protected entry point'),
    );
    client.close();
  });

  it('forwards WebSocket upgrades and stops with open connections', async () => {
    const port = await startServer();
    server!.on('upgrade', (_req, socket) => {
      // Like the ws library, close the connection when the client does
      socket.once('end', () => socket.end());
      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\nhello',
      );
    });

    const data = await new Promise<string>((resolve, reject) => {
      https
        .request(`https://localhost:${port}/api/signals`, {
          ca: credentials.cert,
          headers: { connection: 'upgrade', upgrade: 'websocket' },
        })
        .on('upgrade', (res, socket) => {
          expect(res.statusCode).toBe(101);
          socket.once('data', chunk => resolve(chunk.toString()));
        })
        .on('error', reject)
        .end();
    });
    expect(data).toBe('hello');

    // An idle HTTP/2 session and the upgraded socket must not block shutdown
    const client = http2.connect(`https://localhost:${port}`, {
      ca: credentials.cert,
    });
    await http2Request(client, { ':path': '/api/echo' });
    await server!.stop();
    server = undefined;
    client.destroy();
  });
});
