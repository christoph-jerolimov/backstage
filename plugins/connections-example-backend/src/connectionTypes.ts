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

import { createConnectionType } from '@backstage/connections';
import { z } from 'zod/v4';

/**
 * An example of a connection type that is provided by a plugin rather than
 * built into the framework. The type is namespaced with the plugin ID.
 */
export const exampleServiceConnectionType = createConnectionType({
  type: 'connections-example-backend:example-service',
  title: 'Example Service',
  configSchema: z.object({
    host: z.string(),
    apiBaseUrl: z.string().optional(),
  }),
  authMethods: [
    {
      method: 'none',
      title: 'None',
      configSchema: z.object({}),
    },
    {
      method: 'token',
      title: 'Token',
      configSchema: z.object({
        token: z.string(),
      }),
    },
  ],
  matchAuth(authMethods) {
    return (
      authMethods.find(auth => auth.method === 'token') ??
      authMethods.find(auth => auth.method === 'none')
    );
  },
});
