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

export interface Config {
  dynamicPlugins?: {
    /**
     * The local path, relative to the backstage root, that contains dynamic plugins.
     */
    rootDirectory: string;

    /**
     * Serve the frontend assets of dynamic plugins directly from the built-in
     * HTTP/2 server, without going through the backend middleware. Requires
     * `backend.http2` to be enabled. Experimental, disabled by default.
     *
     * @remarks
     *
     * Setting this to `true` enables it for all dynamic frontend plugins. Use
     * the object form to leave out some plugins.
     */
    http2FrontendAssets?:
      | boolean
      | {
          /** Whether to serve the assets directly. Defaults to `true`. */
          enabled?: boolean;
          /**
           * Package names of dynamic frontend plugins whose assets should
           * always be served by the backend.
           */
          exclude?: string[];
        };
  };
}
