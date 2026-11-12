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
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import {
  connectionsServiceRef,
  connectionTypesRegistryServiceRef,
} from '@backstage/backend-plugin-api/alpha';
import { DefaultConnectionsService } from '@backstage/connections-node';

// The connections service and the connection types registry operate on the
// same set of connections. This internal root service holds that shared
// state, so that each of the two public services can still be replaced.
const rootConnectionsServiceRef = createServiceRef<DefaultConnectionsService>({
  id: 'alpha.core.connections.root',
  scope: 'root',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        rootLogger: coreServices.rootLogger,
        rootLifecycle: coreServices.rootLifecycle,
        config: coreServices.rootConfig,
      },
      async factory({ rootLogger, rootLifecycle, config }) {
        const connectionsService = DefaultConnectionsService.create({
          logger: rootLogger,
          config,
        });

        // Plugins register their connection types during initialization, so
        // entries of an unknown plugin-provided type can only be detected
        // once startup has completed.
        rootLifecycle.addStartupHook(() => {
          connectionsService.warnAboutUnregisteredConnectionTypes();
        });

        return connectionsService;
      },
    }),
});

/**
 * Creates the default plugin-scoped connections service.
 *
 * @alpha
 */
export const connectionsServiceFactory = createServiceFactory({
  service: connectionsServiceRef,
  deps: {
    pluginMetadata: coreServices.pluginMetadata,
    logger: coreServices.logger,
    rootConnections: rootConnectionsServiceRef,
  },
  async factory({ logger, pluginMetadata, rootConnections }) {
    return rootConnections.forPlugin(pluginMetadata.getId(), { logger });
  },
});

/**
 * Creates the default plugin-scoped connection types registry service.
 *
 * @alpha
 */
export const connectionTypesRegistryServiceFactory = createServiceFactory({
  service: connectionTypesRegistryServiceRef,
  deps: {
    pluginMetadata: coreServices.pluginMetadata,
    logger: coreServices.logger,
    rootConnections: rootConnectionsServiceRef,
  },
  async factory({ logger, pluginMetadata, rootConnections }) {
    return rootConnections.registryForPlugin(pluginMetadata.getId(), {
      logger,
    });
  },
});
