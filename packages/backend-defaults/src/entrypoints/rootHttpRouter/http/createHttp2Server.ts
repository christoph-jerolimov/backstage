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

// PROTOTYPE: experimental HTTP/2 support for the Backstage backend.
//
// Enabled with BACKSTAGE_EXPERIMENTAL_HTTP2=shim|bridge, and only together with
// `backend.https`, since browsers only speak HTTP/2 over TLS. In both modes
// HTTP/1.1 clients (including WebSocket upgrades) keep working via ALPN
// fallback (`allowHTTP1`).
//
// - shim: Express handles HTTP/2 requests directly. Express 4 replaces the
//   prototype of every request and response with objects built on the
//   HTTP/1 classes, which crashes on HTTP/2. The shim rebuilds those objects
//   on top of the HTTP/2 compat classes and patches the header differences.
//   Known to break: plugins that mount their own express() app, such as the
//   scaffolder, switch the prototype back and the request hangs.
// - bridge: Express stays on plain HTTP/1.1 on a loopback port. All requests,
//   HTTP/2 and HTTP/1.1, plus WebSocket upgrades, are forwarded to it, so this
//   is an in-process reverse proxy. Requires `backend.trustProxy` to include
//   loopback for correct client IPs and protocol in Express.

import * as http from 'node:http';
import * as http2 from 'node:http2';
import * as net from 'node:net';
import type { AddressInfo } from 'node:net';
import type { Duplex } from 'node:stream';
import { RequestListener } from 'node:http';
import { LoggerService } from '@backstage/backend-plugin-api';

export type Http2Mode = 'shim' | 'bridge';

export function readHttp2Mode(): Http2Mode | undefined {
  const value = process.env.BACKSTAGE_EXPERIMENTAL_HTTP2;
  if (!value) {
    return undefined;
  }
  if (value !== 'shim' && value !== 'bridge') {
    throw new Error(
      `Invalid BACKSTAGE_EXPERIMENTAL_HTTP2 value '${value}', expected 'shim' or 'bridge'`,
    );
  }
  return value;
}

// Headers that are only valid in HTTP/1 and that node:http2 refuses to send
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-connection',
  'transfer-encoding',
  'upgrade',
  'http2-settings',
  'te',
]);

export async function createHttp2Server(
  listener: RequestListener,
  credentials: { key: string | Buffer; cert: string | Buffer },
  mode: Http2Mode,
  deps: { logger: LoggerService },
): Promise<http.Server> {
  deps.logger.warn(
    `Experimental HTTP/2 support enabled in '${mode}' mode, do not use in production`,
  );

  const bridge =
    mode === 'bridge' ? await createBridgeHandler(listener) : undefined;
  const handler = bridge?.handler ?? createShimHandler(listener);

  const server = http2.createSecureServer(
    { ...credentials, allowHTTP1: true },
    handler as any,
  );
  if (bridge) {
    server.on('upgrade', bridge.onUpgrade);
    // Shut down the internal server together with the public one
    const close = server.close;
    server.close = function closeWithBridge(callback?: (err?: Error) => void) {
      bridge.agent.destroy();
      bridge.internal.closeAllConnections();
      bridge.internal.close();
      return close.call(this, callback);
    };
  }

  // Http2SecureServer lacks the connection helpers that http.Server has and
  // that the backend uses on shutdown. Track connections ourselves, both
  // HTTP/2 sessions and HTTP/1.1 fallback sockets.
  const sessions = new Set<http2.ServerHttp2Session>();
  const sockets = new Set<net.Socket>();
  server.on('session', session => {
    sessions.add(session);
    session.once('close', () => sessions.delete(session));
  });
  server.on('secureConnection', (socket: net.Socket) => {
    // Unlike http.Server, the HTTP/1.1 fallback does not disable Nagle's
    // algorithm, which adds ~40ms per response when headers are flushed early
    socket.setNoDelay(true);
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  Object.assign(server, {
    closeAllConnections() {
      for (const session of sessions) {
        session.destroy();
      }
      for (const socket of sockets) {
        socket.destroy();
      }
    },
    closeIdleConnections() {
      // Graceful for HTTP/2 (GOAWAY), there is no cheap way to tell whether
      // an HTTP/1.1 fallback socket is idle, so those are left to time out
      for (const session of sessions) {
        session.close();
      }
    },
  });

  // The rest of the backend expects an http.Server, which this is mostly
  // compatible with at runtime ('upgrade' events, listen, close, address).
  return server as unknown as http.Server;
}

function createShimHandler(listener: RequestListener) {
  const app = listener as RequestListener & {
    request: object;
    response: object;
  };
  if (!app.request || !app.response) {
    throw new Error('HTTP/2 shim mode requires an Express app as listener');
  }

  const h1 = { request: app.request, response: app.response };
  const h2 = {
    request: rebase(h1.request, http2.Http2ServerRequest, app),
    response: rebase(h1.response, http2.Http2ServerResponse, app),
  };

  // Express reads app.request and app.response synchronously when a request
  // enters the app, so the getters return the variant for the current request.
  let current = h1;
  Object.defineProperty(app, 'request', {
    configurable: true,
    get: () => current.request,
  });
  Object.defineProperty(app, 'response', {
    configurable: true,
    get: () => current.response,
  });

  return (req: any, res: any) => {
    if (req.httpVersionMajor !== 2) {
      listener(req, res);
      return;
    }

    // Hide HTTP/2 pseudo-headers (':path', ':authority', ...) from middleware
    // and map ':authority' to 'host', which Express and others rely on.
    const headers: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(req.headers)) {
      if (!name.startsWith(':')) {
        headers[name] = value;
      }
    }
    headers.host ??= req.headers[':authority'];
    Object.defineProperty(req, 'headers', {
      value: headers,
      writable: true,
      configurable: true,
    });

    // Drop HTTP/1-only response headers, for example from proxied upstreams,
    // which would otherwise throw and crash the process.
    const setHeader = res.setHeader;
    res.setHeader = function setH2Header(name: string, value: unknown) {
      if (HOP_BY_HOP_HEADERS.has(String(name).toLowerCase())) {
        return this;
      }
      return setHeader.call(this, name, value);
    };
    const writeHead = res.writeHead;
    res.writeHead = function writeH2Head(status: number, ...args: any[]) {
      const last = args[args.length - 1];
      if (last && typeof last === 'object' && !Array.isArray(last)) {
        for (const name of Object.keys(last)) {
          if (HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
            delete last[name];
          }
        }
      }
      return writeHead.call(this, status, ...args);
    };

    current = h2;
    try {
      listener(req, res);
    } finally {
      current = h1;
    }
  };
}

// Copies Express's request/response methods onto a prototype that inherits
// from the given HTTP/2 compat class instead of the HTTP/1 one.
function rebase(appProto: object, base: Function, app: object) {
  // app.request is Object.create(express.request, { app }), the methods live
  // one step up the chain
  const expressProto = Object.getPrototypeOf(appProto);
  const proto = Object.create(base.prototype);
  for (const key of Reflect.ownKeys(expressProto)) {
    if (key === 'app') {
      continue;
    }
    Object.defineProperty(
      proto,
      key,
      Object.getOwnPropertyDescriptor(expressProto, key)!,
    );
  }
  return Object.create(proto, {
    app: { configurable: true, enumerable: true, writable: true, value: app },
  });
}

async function createBridgeHandler(listener: RequestListener) {
  const internal = http.createServer(listener);
  await new Promise<void>(resolve =>
    internal.listen(0, '127.0.0.1', () => resolve()),
  );
  const port = (internal.address() as AddressInfo).port;
  const agent = new http.Agent({ keepAlive: true });

  // All traffic, HTTP/1.1 included, goes through the internal server. Plugins
  // that attach to the server of an incoming request, such as signals with
  // its WebSocket 'upgrade' listener, then consistently see the same server.
  // Typed as HTTP/1 objects, the HTTP/2 compat API is close enough for this
  const handler = (req: http.IncomingMessage, res: http.ServerResponse) => {
    const headers: http.OutgoingHttpHeaders = {};
    for (const [name, value] of Object.entries(req.headers)) {
      if (!name.startsWith(':') && !HOP_BY_HOP_HEADERS.has(name)) {
        headers[name] = value;
      }
    }
    const authority = String(req.headers[':authority'] ?? req.headers.host);
    headers.host = authority;
    headers['x-forwarded-proto'] = 'https';
    headers['x-forwarded-host'] = authority;
    headers['x-forwarded-for'] = req.socket.remoteAddress;

    const upstream = http.request(
      {
        host: '127.0.0.1',
        port,
        method: req.method,
        path: req.url,
        headers,
        agent,
      },
      upstreamRes => {
        const responseHeaders: http.OutgoingHttpHeaders = {};
        for (const [name, value] of Object.entries(upstreamRes.headers)) {
          if (!HOP_BY_HOP_HEADERS.has(name)) {
            responseHeaders[name] = value;
          }
        }
        res.writeHead(upstreamRes.statusCode ?? 502, responseHeaders);
        // Send headers right away, some endpoints flush headers and then hold
        // the body open, for example long polling and server-sent events
        res.flushHeaders();
        upstreamRes.pipe(res);
      },
    );
    upstream.on('error', error => {
      if (!res.headersSent) {
        res.writeHead(502);
      }
      res.end(String(error.message));
    });
    res.on('close', () => upstream.destroy());
    req.pipe(upstream);
  };

  // WebSocket upgrades only exist in HTTP/1.1, forward them as raw sockets
  const onUpgrade = (
    req: http.IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ) => {
    const upstream = net.connect(port, '127.0.0.1', () => {
      const lines = [`${req.method} ${req.url} HTTP/1.1`];
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
      }
      lines.push(`X-Forwarded-For: ${req.socket.remoteAddress}`);
      lines.push('X-Forwarded-Proto: https');
      upstream.write(`${lines.join('\r\n')}\r\n\r\n`);
      upstream.write(head);
      socket.pipe(upstream).pipe(socket);
    });
    upstream.on('error', () => socket.destroy());
    socket.on('error', () => upstream.destroy());
  };

  return { handler, onUpgrade, internal, agent };
}
