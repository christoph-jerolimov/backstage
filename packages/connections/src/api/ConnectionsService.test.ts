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
import { z } from 'zod/v4';
import { createConnectionType } from '../system/createConnectionType';
import type { ConnectionsService } from './ConnectionsService';

describe('ConnectionsService', () => {
  it('infers query fields from the connection type', () => {
    const find = jest.fn();
    const service = { find } as unknown as ConnectionsService;

    void service.find({
      type: 'github',
      query: { url: 'https://github.com/backstage/backstage' },
      authMethods: ['token'],
    });
    void service.find({
      type: 'aws',
      query: { accountId: '123456789012' },
      authMethods: ['account'],
    });
    void service.find({
      type: 'github',
      query: {
        // @ts-expect-error - GitHub lookups require a URL query
        accountId: '123456789012',
      },
      authMethods: ['token'],
    });

    expect(find).toHaveBeenCalledTimes(3);
  });

  it('infers query, auth methods, and result from a connection type definition', async () => {
    const artifactoryConnectionType = createConnectionType({
      type: 'artifactory',
      title: 'Artifactory',
      configSchema: z.object({ host: z.string() }),
      authMethods: [
        {
          method: 'token',
          title: 'Token',
          configSchema: z.object({ token: z.string() }),
        },
        { method: 'none', title: 'None', configSchema: z.object({}) },
      ],
    });
    const find = jest.fn().mockResolvedValue({
      type: 'artifactory',
      title: 'Artifactory',
      host: 'artifactory.example.com',
      auth: { method: 'token', title: 'Token', token: 'secret' },
    });
    const service = { find } as unknown as ConnectionsService;

    const connection = await service.find({
      type: artifactoryConnectionType,
      query: { url: 'https://artifactory.example.com/repo' },
      authMethods: ['token'],
    });
    const type: 'artifactory' = connection.type;
    const host: string = connection.host;
    const token: string = connection.auth.token;
    expect([type, host, token]).toEqual([
      'artifactory',
      'artifactory.example.com',
      'secret',
    ]);

    const info = await service.find({
      type: artifactoryConnectionType,
      query: { url: 'https://artifactory.example.com/repo' },
    });
    // @ts-expect-error - auth is only returned when auth methods are requested
    expect(info.auth).toBeDefined();

    void service.find({
      type: artifactoryConnectionType,
      query: {
        // @ts-expect-error - host lookups require a URL query
        accountId: '123456789012',
      },
      authMethods: ['token'],
    });
    // @ts-expect-error - only declared auth methods can be requested
    void service.find({
      type: artifactoryConnectionType,
      query: { url: 'https://artifactory.example.com/repo' },
      authMethods: ['app'],
    });
    void service.find({
      // @ts-expect-error - a key that is not built-in needs its definition
      type: 'artifactory',
      query: { url: 'https://artifactory.example.com/repo' },
    });
  });
});
