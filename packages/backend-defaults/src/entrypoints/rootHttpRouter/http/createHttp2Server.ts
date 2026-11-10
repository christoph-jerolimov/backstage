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

import { LoggerService } from '@backstage/backend-plugin-api';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as http2 from 'node:http2';
import type * as net from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';
import { createProxyServer } from 'http-proxy-3';
import { serveStaticAsset } from './serveStaticAsset';
import {
  ExtendedHttpServer,
  HttpServerHttp2Options,
  HttpServerHttp2StaticAssetsOptions,
  HttpServerOptions,
} from './types';

// Forwarding headers sent by clients are dropped, since the HTTP/2 server is
// the first hop. The proxy then sets its own values from the connection.
const CLIENT_FORWARDING_HEADERS = [
  'forwarded',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-port',
  'x-forwarded-proto',
];

type Request = http.IncomingMessage | http2.Http2ServerRequest;
type Response = http.ServerResponse | http2.Http2ServerResponse;

/**
 * Leaves out static asset directories that belong to an app running in
 * protected mode. In that mode the app backend only serves the main app
 * bundle to signed-in users, which a direct file server would bypass.
 */
function filterStaticAssets(
  staticAssets: HttpServerHttp2StaticAssetsOptions[],
  logger: LoggerService,
): HttpServerHttp2StaticAssetsOptions[] {
  return staticAssets.filter(mount => {
    if (fs.existsSync(resolvePath(mount.directory, '..', 'public'))) {
      logger.warn(
        `Not serving ${mount.path} directly over HTTP/2, since ${mount.directory} belongs to an app with a protected entry point. Requests are forwarded to the backend instead.`,
      );
      return false;
    }
    logger.info(
      `Serving ${mount.path} directly over HTTP/2 from ${mount.directory}`,
    );
    return true;
  });
}

async function createBackendSocketPath(): Promise<{
  socketPath: string;
  cleanup(): Promise<void>;
}> {
  if (process.platform === 'win32') {
    return {
      socketPath: `\\\\?\\pipe\\backstage-backend-${randomUUID()}`,
      async cleanup() {},
    };
  }
  // mkdtemp creates the directory with 0700 permissions, so that only the
  // current user can connect to the socket.
  const dir = await fs.promises.mkdtemp(join(tmpdir(), 'backstage-http2-'));
  return {
    socketPath: join(dir, 'backend.sock'),
    async cleanup() {
      await fs.promises.rm(dir, { recursive: true, force: true });
    },
  };
}

/**
 * Creates an HTTP/2 server in front of an HTTP/1.1 request listener.
 *
 * @remarks
 *
 * The returned server is the HTTP/1.1 server that runs the listener. It
 * listens on a private local socket, while a separate HTTP/2 server, which
 * also accepts HTTP/1.1, listens on the configured address and forwards
 * requests to it. Static assets can be served directly by the HTTP/2 server.
 *
 * @internal
 */
export async function createHttp2Server(
  listener: http.RequestListener,
  options: {
    listen: HttpServerOptions['listen'];
    credentials: { key: string | Buffer; cert: string | Buffer };
    http2: HttpServerHttp2Options;
  },
  deps: { logger: LoggerService },
): Promise<ExtendedHttpServer> {
  const { logger } = deps;
  const backendServer = http.createServer(listener);
  const { socketPath, cleanup } = await createBackendSocketPath();
  const staticAssets = filterStaticAssets(
    options.http2.staticAssets ?? [],
    logger,
  );

  const agent = new http.Agent({ keepAlive: true });
  const proxy = createProxyServer({
    target: { socketPath, host: 'localhost', port: 0 },
    xfwd: true,
    agent,
  });

  proxy.on('error', (error, _req, resOrSocket) => {
    logger.warn(`Failed to forward HTTP/2 request to backend: ${error}`);
    if (resOrSocket && 'writeHead' in resOrSocket) {
      if (!resOrSocket.headersSent) {
        resOrSocket.writeHead(502);
      }
      resOrSocket.end();
    } else {
      (resOrSocket as net.Socket | undefined)?.destroy();
    }
  });

  proxy.on('proxyRes', (proxyRes, _req, res) => {
    // Stop the backend request if the client goes away first. The proxy does
    // this itself for HTTP/1.1 clients, but HTTP/2 responses report as
    // finished once the client cancels the stream.
    res.once('close', () => {
      if (!proxyRes.readableEnded) {
        proxyRes.destroy();
      }
    });

    // The proxy only sends the response headers along with the first chunk of
    // the body. Streamed responses, such as long polling or server-sent events,
    // need their headers to reach the client right away. This runs after the
    // proxy has copied the headers, which happens right after this event.
    if (proxyRes.headers['content-length'] === undefined) {
      queueMicrotask(() => {
        if (!res.headersSent && !res.writableEnded) {
          res.flushHeaders();
        }
      });
    }
  });

  const stripForwardingHeaders = (req: Request) => {
    for (const header of CLIENT_FORWARDING_HEADERS) {
      delete req.headers[header];
    }
  };

  const frontServer = http2.createSecureServer(
    { ...options.credentials, allowHTTP1: true },
    (req: Request, res: Response) => {
      stripForwardingHeaders(req);
      serveStaticAsset(req, res, staticAssets)
        .then(served => {
          if (!served) {
            proxy.web(req as http.IncomingMessage, res as http.ServerResponse);
          }
        })
        .catch(error => {
          logger.warn(`Failed to serve static asset ${req.url}: ${error}`);
          if (!res.headersSent) {
            (res as http.ServerResponse).writeHead(500);
          }
          res.end();
        });
    },
  );

  // WebSocket upgrades arrive over HTTP/1.1 and are forwarded as-is. Both
  // ends are tracked, since open WebSockets would otherwise block shutdown.
  const upgradedSockets = new Set<net.Socket>();
  const trackUpgradedSocket = (socket: net.Socket) => {
    upgradedSockets.add(socket);
    socket.once('close', () => upgradedSockets.delete(socket));
  };
  proxy.on('open', trackUpgradedSocket);
  frontServer.on(
    'upgrade',
    (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
      stripForwardingHeaders(req);
      trackUpgradedSocket(socket);
      proxy.ws(req, socket, head);
    },
  );

  // Track open connections so that they can be closed on shutdown
  const sessions = new Set<http2.ServerHttp2Session>();
  frontServer.on('session', session => {
    sessions.add(session);
    session.once('close', () => sessions.delete(session));
  });
  const sockets = new Set<net.Socket>();
  frontServer.on('secureConnection', socket => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });

  const listen = (
    server: net.Server,
    ...args: [path: string] | [port: number, host: string]
  ) =>
    new Promise<void>((resolve, reject) => {
      const handleStartupError = (error: Error) => {
        server.close();
        reject(error);
      };
      server.once('error', handleStartupError);
      server.listen(...(args as [number, string]), () => {
        server.off('error', handleStartupError);
        resolve();
      });
    });

  const close = (server: net.Server) =>
    new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });

  return Object.assign(backendServer, {
    async start() {
      await listen(backendServer, socketPath);
      const { host, port } = options.listen;
      try {
        await listen(frontServer, port, host);
      } catch (error) {
        await close(backendServer);
        await cleanup();
        throw error;
      }
      logger.info(`Listening on ${host}:${port} with HTTP/2`);
    },

    async stop() {
      const frontClosed = close(frontServer);
      for (const socket of upgradedSockets) {
        socket.destroy();
      }
      // Let in-flight HTTP/2 streams finish, but stop accepting new ones
      for (const session of sessions) {
        if (process.env.NODE_ENV === 'development') {
          session.destroy();
        } else {
          session.close();
        }
      }

      // The backend server waits for open connections before it closes, so
      // pooled connections are closed as soon as their request is done.
      agent.on('free', socket => socket.destroy());
      for (const socket of Object.values(agent.freeSockets).flat()) {
        socket?.destroy();
      }
      if (process.env.NODE_ENV === 'development') {
        backendServer.closeAllConnections();
      }
      await close(backendServer);

      // Any remaining connections are idle HTTP/1.1 keep-alive connections
      for (const socket of sockets) {
        socket.destroy();
      }
      await frontClosed;
      agent.destroy();
      await cleanup();
    },

    port() {
      const address = frontServer.address();
      if (typeof address === 'string' || address === null) {
        throw new Error(`Unexpected server address '${address}'`);
      }
      return address.port;
    },
  });
}
