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
 * Registry of the connection types known to a backend.
 *
 * @remarks
 *
 * The registry always contains the built-in connection types. Backend plugins
 * and modules can register additional types, which makes connections of that
 * type configurable under `connections` and available through
 * `ConnectionsService.find`.
 *
 * @public
 */
export interface ConnectionsRegistryService {
  /**
   * Registers an additional connection type, created with
   * `createConnectionType`.
   *
   * @remarks
   *
   * Throws if a built-in or previously registered connection type already
   * uses the same `type` key.
   */
  register(connectionType: ConnectionTypeDefinition): void;

  /**
   * Returns the built-in or registered connection type with the given key,
   * or `undefined` if there is none.
   */
  getConnectionType(type: string): ConnectionTypeDefinition | undefined;

  /**
   * Returns all built-in and registered connection types.
   */
  listConnectionTypes(): ConnectionTypeDefinition[];
}
