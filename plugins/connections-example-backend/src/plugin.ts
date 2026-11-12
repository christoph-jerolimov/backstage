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
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import {
  connectionsServiceRef,
  connectionTypesRegistryServiceRef,
  declareConnection,
} from '@backstage/backend-plugin-api/alpha';
import { exampleServiceConnectionType } from './connectionTypes';

/**
 * connectionsExampleBackendPlugin backend plugin
 *
 * @public
 */
export const connectionsExampleBackendPlugin = createBackendPlugin({
  pluginId: 'connections-example-backend',
  register(reg) {
    declareConnection(reg, {
      type: 'github',
      description: 'Used by the example /find endpoint to look up GitHub hosts',
    });
    declareConnection(reg, {
      type: 'gitlab',
      description: 'Used by the example /find endpoint to look up GitLab hosts',
    });
    declareConnection(reg, {
      type: exampleServiceConnectionType.type,
      description:
        'Used by the example /find endpoint to look up a connection type provided by this plugin',
    });
    reg.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        connections: connectionsServiceRef,
        connectionTypesRegistry: connectionTypesRegistryServiceRef,
      },
      async init({
        httpAuth,
        httpRouter,
        connections,
        connectionTypesRegistry,
        logger,
      }) {
        connectionTypesRegistry.register(exampleServiceConnectionType);

        httpRouter.use(
          await createRouter({
            httpAuth,
            connections,
            logger,
          }),
        );
      },
    });
  },
});
