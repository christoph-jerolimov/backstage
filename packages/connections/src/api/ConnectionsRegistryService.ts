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
 * Registers connection types in addition to the built-in ones, so that
 * connections of those types can be configured under `connections` and looked
 * up through the {@link ConnectionsService}.
 *
 * @public
 */
export interface ConnectionsRegistryService {
  /**
   * Registers a connection type created with {@link createConnectionType}.
   *
   * @remarks
   *
   * Connections of this type that are present in configuration are validated
   * as part of the registration, which throws if any of them is invalid.
   *
   * Registering the same definition more than once is allowed, which lets
   * every plugin and module that depends on a shared connection type register
   * it. Registering a different definition for the key of a built-in type or
   * of an already registered type throws.
   */
  registerConnectionType(connectionType: ConnectionTypeDefinition): void;
}
