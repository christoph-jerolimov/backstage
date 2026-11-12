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
import { InputError } from '@backstage/errors';
import type {
  ConnectionLookupStrategy,
  ConnectionTypeDefinition,
} from '../api/ConnectionType';
import { connectionTypes } from '../definitions/types';

/**
 * The connection types to resolve configuration against, keyed by their
 * `type`.
 */
export type ConnectionTypeLookup = ReadonlyMap<
  string,
  ConnectionTypeDefinition
>;

/**
 * Creates the lookup of all connection types that configuration is resolved
 * against: the built-in types plus any additional ones, which must not reuse
 * the key of another type.
 */
export function createConnectionTypeLookup(
  additionalTypes: readonly ConnectionTypeDefinition[] = [],
): ConnectionTypeLookup {
  const builtInTypes = new Map<string, ConnectionTypeDefinition>(
    Object.entries(connectionTypes),
  );
  const lookup = new Map(builtInTypes);

  for (const connectionType of additionalTypes) {
    const existing = lookup.get(connectionType.type);
    if (existing === connectionType) {
      continue;
    }
    if (existing) {
      throw new InputError(
        builtInTypes.has(connectionType.type)
          ? `Connection type "${connectionType.type}" conflicts with the built-in connection type of the same name`
          : `Connection type "${connectionType.type}" is defined more than once`,
      );
    }
    lookup.set(connectionType.type, connectionType);
  }

  return lookup;
}

/**
 * The connection field that holds the identity of each connection, per lookup
 * strategy, used to key connections of multiton connection types. Mirrors the
 * `identityField` of each strategy definition in the connections-node
 * package's lookupStrategies; the Record over ConnectionLookupStrategy keeps both sides
 * exhaustive.
 */
export const identityFields: Record<
  ConnectionLookupStrategy,
  string | undefined
> = {
  host: 'host',
  aws: undefined,
};
