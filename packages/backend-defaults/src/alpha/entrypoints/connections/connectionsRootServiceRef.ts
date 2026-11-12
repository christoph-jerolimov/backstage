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
import { DefaultConnectionsService } from '@backstage/connections-node';

/**
 * The state shared by the plugin-scoped connections and connections registry
 * services: the connections in configuration and the connection types that
 * plugins have registered.
 *
 * @internal
 */
export const connectionsRootServiceRef =
  createServiceRef<DefaultConnectionsService>({
    id: 'alpha.core.connections.root',
    scope: 'root',
    defaultFactory: async service =>
      createServiceFactory({
        service,
        deps: {
          logger: coreServices.rootLogger,
          config: coreServices.rootConfig,
          lifecycle: coreServices.rootLifecycle,
        },
        async factory({ logger, config, lifecycle }) {
          const connections = DefaultConnectionsService.create({
            logger,
            config,
          });

          // Plugins register connection types as they initialize, so it is
          // only once startup has completed that a connection is known to be
          // of a type that nothing in this backend provides.
          lifecycle.addStartupHook(() => {
            const types = connections.getUnregisteredConnectionTypes();
            if (types.length > 0) {
              logger.warn(
                `Ignoring configured connections of type ${types
                  .map(type => `"${type}"`)
                  .join(
                    ', ',
                  )}, as no connection type with that name is built in or has been registered by an installed plugin`,
              );
            }
          });

          return connections;
        },
      }),
  });
