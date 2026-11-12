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

/**
 * Looks up the connections that are available to a plugin.
 *
 * @remarks
 *
 * The `type` is either the key of a built-in connection type, such as
 * `'github'`, or the definition of a connection type that has been registered
 * with the {@link ConnectionsRegistryService}.
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
