/*
 * Copyright 2023 The Backstage Authors
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

import * as http from 'node:http';

/**
 * An HTTP server extended with utility methods.
 *
 * @public
 */
export interface ExtendedHttpServer extends http.Server {
  start(): Promise<void>;

  stop(): Promise<void>;

  port(): number;
}

/**
 * Options for starting up an HTTP server.
 *
 * @public
 */
export type HttpServerOptions = {
  listen: {
    port: number;
    host: string;
  };
  https?: {
    certificate: HttpServerCertificateOptions;
  };
  /**
   * Serve HTTP/2 to clients. Requires `https` to be set.
   *
   * @remarks
   *
   * Express does not support HTTP/2, so the server is split in two: a public
   * HTTP/2 server that also accepts HTTP/1.1, and the Express server on a
   * private local socket that it forwards requests to over HTTP/1.1.
   */
  http2?: HttpServerHttp2Options;
};

/**
 * Options for serving HTTP/2 from an HTTP server.
 *
 * @public
 */
export type HttpServerHttp2Options = {
  /**
   * Directories of static files that the HTTP/2 server serves directly,
   * without forwarding the requests to Express.
   */
  staticAssets?: HttpServerHttp2StaticAssetsOptions[];
};

/**
 * A directory of static files served directly by the HTTP/2 server.
 *
 * @public
 */
export type HttpServerHttp2StaticAssetsOptions = {
  /** The URL path that the files are served under, for example `/static`. */
  path: string;
  /** The directory that the files are read from. */
  directory: string;
};

/**
 * Options for configuring HTTPS for an HTTP server.
 *
 * @public
 */
export type HttpServerCertificateOptions =
  | {
      type: 'pem';
      key: string;
      cert: string;
    }
  | {
      type: 'generated';
      hostname: string;
    };
