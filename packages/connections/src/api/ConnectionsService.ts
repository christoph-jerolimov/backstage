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
import { ConnectionType, LookupConnectionType } from '../definitions';
import { Connection } from './Connection';
import { ConnectionTypeDefinition } from './ConnectionType';
import type { ConnectionsRegistryService } from './ConnectionsRegistryService';

/**
 * Looks up the connections available to a plugin.
 *
 * @remarks
 *
 * Built-in connection types are addressed by their key, for example
 * `type: 'github'`. Connection types registered through the
 * {@link ConnectionsRegistryService} are addressed by passing the registered
 * definition as `type`, which gives the same typed query, auth methods, and
 * result as the built-in types.
 *
 * @public
 */
export interface ConnectionsService {
  find<
    TType extends ConnectionType | ConnectionTypeDefinition,
    TAuthMethod extends LookupConnectionType<TType>['authMethods'][number]['method'],
  >(options: {
    type: TType;
    query: LookupConnectionType<TType> extends ConnectionTypeDefinition<
      infer IDefinition
    >
      ? IDefinition['query']
      : never;
    authMethods: readonly [TAuthMethod, ...TAuthMethod[]];
  }): Promise<Connection<TType, TAuthMethod>>;

  find<TType extends ConnectionType | ConnectionTypeDefinition>(options: {
    type: TType;
    query: LookupConnectionType<TType> extends ConnectionTypeDefinition<
      infer IDefinition
    >
      ? IDefinition['query']
      : never;
  }): Promise<Omit<Connection<TType>, 'auth'>>;
}
