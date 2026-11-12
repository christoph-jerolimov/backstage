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
  connectionTypes,
  type ConnectionsRegistryService,
  type ConnectionTypeDefinition,
} from '@backstage/connections';
import { ConflictError, InputError } from '@backstage/errors';
import { lookupStrategies } from './lookupStrategies';

/** @public */
export class DefaultConnectionsRegistryService
  implements ConnectionsRegistryService
{
  readonly #builtIn: ReadonlyMap<string, ConnectionTypeDefinition> = new Map(
    Object.entries(connectionTypes),
  );
  readonly #registered = new Map<string, ConnectionTypeDefinition>();

  private constructor() {}

  static create(): DefaultConnectionsRegistryService {
    return new DefaultConnectionsRegistryService();
  }

  register(connectionType: ConnectionTypeDefinition): void {
    const { type } = connectionType;
    if (typeof type !== 'string' || !type) {
      throw new InputError(
        'A registered connection type must have a non-empty "type" key',
      );
    }
    if (!Object.hasOwn(lookupStrategies, connectionType.lookupStrategy)) {
      throw new InputError(
        `Connection type "${type}" uses the unknown lookup strategy "${connectionType.lookupStrategy}"`,
      );
    }
    if (this.#builtIn.has(type)) {
      throw new ConflictError(
        `Connection type "${type}" is a built-in connection type and cannot be registered again`,
      );
    }
    if (this.#registered.has(type)) {
      throw new ConflictError(
        `Connection type "${type}" has already been registered`,
      );
    }
    this.#registered.set(type, connectionType);
  }

  getConnectionType(type: string): ConnectionTypeDefinition | undefined {
    return this.#builtIn.get(type) ?? this.#registered.get(type);
  }

  listConnectionTypes(): ConnectionTypeDefinition[] {
    return [...this.#builtIn.values(), ...this.#registered.values()];
  }
}
