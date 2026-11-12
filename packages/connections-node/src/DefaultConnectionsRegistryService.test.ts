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
import { connectionTypes, createConnectionType } from '@backstage/connections';
import { z } from 'zod/v4';
import { DefaultConnectionsRegistryService } from './DefaultConnectionsRegistryService';

const createType = (type: string) =>
  createConnectionType({
    type,
    title: type,
    configSchema: z.object({ host: z.string() }),
    authMethods: [
      { method: 'none', title: 'None', configSchema: z.object({}) },
    ],
  });

describe('DefaultConnectionsRegistryService', () => {
  it('holds the built-in connection types alongside registered ones', () => {
    const registry = DefaultConnectionsRegistryService.create();
    const builtIn = Object.values(connectionTypes);

    expect(registry.listConnectionTypes()).toEqual(builtIn);
    expect(registry.getConnectionType('github')).toBe(connectionTypes.github);
    expect(registry.getConnectionType('artifactory')).toBeUndefined();

    const artifactory = createType('artifactory');
    registry.register(artifactory);

    expect(registry.getConnectionType('artifactory')).toBe(artifactory);
    expect(registry.listConnectionTypes()).toEqual([...builtIn, artifactory]);
  });

  it('rejects connection types that conflict or are malformed', () => {
    const registry = DefaultConnectionsRegistryService.create();
    registry.register(createType('artifactory'));

    expect(() => registry.register(createType('artifactory'))).toThrow(
      'Connection type "artifactory" has already been registered',
    );
    expect(() => registry.register(createType('github'))).toThrow(
      'Connection type "github" is a built-in connection type and cannot be registered again',
    );
    expect(() => registry.register(createType(''))).toThrow(
      'A registered connection type must have a non-empty "type" key',
    );
    expect(() =>
      registry.register({
        ...createType('nexus'),
        lookupStrategy: 'unknown' as 'host',
      }),
    ).toThrow(
      'Connection type "nexus" uses the unknown lookup strategy "unknown"',
    );
    expect(registry.getConnectionType('nexus')).toBeUndefined();
  });
});
