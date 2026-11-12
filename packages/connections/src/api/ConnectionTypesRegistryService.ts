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
import type { ConnectionTypeDefinition } from './ConnectionType';

/**
 * Lets a plugin or module contribute its own connection types, so that they
 * can be configured under `connections` and looked up through the
 * {@link ConnectionsService} in the same way as the built-in types.
 *
 * @public
 */
export interface ConnectionTypesRegistryService {
  /**
   * Registers a connection type created with `createConnectionType`.
   *
   * The `type` of the definition must be namespaced with the ID of the
   * calling plugin, in the form `<pluginId>:<name>`, for example
   * `jira:server`. Entries of that type in the `connections` configuration
   * are validated as part of this call, which throws if any of them are
   * invalid.
   */
  register(connectionType: ConnectionTypeDefinition): void;
}
