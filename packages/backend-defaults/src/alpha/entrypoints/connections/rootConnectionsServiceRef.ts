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
 * The connections of the backend instance, shared by the plugin-scoped
 * connections and connections registry services. This is an implementation
 * detail of the default factories for those services and is intentionally not
 * exported from the package.
 *
 * @internal
 */
export const rootConnectionsServiceRef =
  createServiceRef<DefaultConnectionsService>({
    id: 'alpha.core.connections.root',
    scope: 'root',
    defaultFactory: async service =>
      createServiceFactory({
        service,
        // Connections config is only loaded and validated if some plugin
        // uses the connections or connections registry service.
        initialization: 'lazy',
        deps: {
          rootLogger: coreServices.rootLogger,
          rootLifecycle: coreServices.rootLifecycle,
          config: coreServices.rootConfig,
        },
        async factory({ rootLogger, rootLifecycle, config }) {
          const connections = DefaultConnectionsService.create({
            logger: rootLogger,
            config,
          });

          // Plugins register connection types as they are initialized, so it
          // is only known which configured types nobody has claimed once the
          // whole backend has started.
          rootLifecycle.addStartupHook(() =>
            connections.warnAboutUnregisteredConnectionTypes(),
          );

          return connections;
        },
      }),
  });
