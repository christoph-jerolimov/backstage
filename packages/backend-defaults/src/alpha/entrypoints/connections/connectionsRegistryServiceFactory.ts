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
} from '@backstage/backend-plugin-api';
import { connectionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { rootConnectionsServiceRef } from './rootConnectionsServiceRef';

/**
 * Creates the default plugin-scoped connections registry service, which adds
 * connection types to the default connections service.
 *
 * @alpha
 */
export const connectionsRegistryServiceFactory = createServiceFactory({
  service: connectionsRegistryServiceRef,
  deps: {
    pluginMetadata: coreServices.pluginMetadata,
    rootConnections: rootConnectionsServiceRef,
  },
  async factory({ pluginMetadata, rootConnections }) {
    return rootConnections.registryForPlugin(pluginMetadata.getId());
  },
});
