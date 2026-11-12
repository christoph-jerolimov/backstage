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
import { ConnectionTypeDefinition } from './ConnectionType';

/**
 * Registers connection types beyond the ones that are built into Backstage.
 *
 * @public
 */
export interface ConnectionsRegistryService {
  /**
   * Registers a connection type, created with `createConnectionType`.
   *
   * @remarks
   *
   * Connections of the registered type in the `connections` configuration are
   * validated as part of this call, which throws if any of them are invalid.
   * Once registered, the type can be passed to `ConnectionsService.find`.
   *
   * Registering the same connection type more than once is allowed, so that
   * every plugin and module that uses a shared type can register it. An error
   * is thrown if the type key is already used by a different definition,
   * including the built-in connection types.
   */
  register(connectionType: ConnectionTypeDefinition): void;
}
