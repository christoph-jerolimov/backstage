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
import type { Connection } from './Connection';
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

  it('infers query fields and the result from a connection type definition', async () => {
    const acmeConnectionType = createConnectionType({
      type: 'acme',
      title: 'Acme',
      configSchema: z.object({ host: z.string(), region: z.string() }),
      authMethods: [
        { method: 'none', title: 'None', configSchema: z.object({}) },
        {
          method: 'token',
          title: 'Token',
          configSchema: z.object({ token: z.string() }),
        },
      ],
    });
    const accountConnectionType = createConnectionType({
      type: 'acme-account',
      title: 'Acme Account',
      lookupStrategy: 'aws',
      cardinality: 'singleton',
      configSchema: z.object({}),
      authMethods: [
        {
          method: 'account',
          title: 'Account',
          configSchema: z.object({ accountId: z.string() }),
        },
      ],
    });

    const find = jest.fn().mockResolvedValue({
      type: 'acme',
      title: 'Acme',
      host: 'acme.test',
      region: 'eu',
      auth: { method: 'token', title: 'Token', token: 'secret' },
    });
    const service = { find } as unknown as ConnectionsService;

    const connection = await service.find({
      type: acmeConnectionType,
      query: { url: 'https://acme.test/project' },
      authMethods: ['token'],
    });
    const typed: Connection<typeof acmeConnectionType, 'token'> = connection;
    const type: 'acme' = typed.type;
    const fields: string[] = [
      connection.host,
      connection.region,
      connection.auth.token,
    ];
    const method: 'token' = connection.auth.method;
    expect([type, method, ...fields]).toEqual([
      'acme',
      'token',
      'acme.test',
      'eu',
      'secret',
    ]);

    const info = await service.find({
      type: acmeConnectionType,
      query: { url: 'https://acme.test/project' },
    });
    const host: string = info.host;
    // @ts-expect-error - auth is only returned when auth methods are requested
    expect(info.auth?.token).toBe('secret');
    expect(host).toBe('acme.test');

    void service.find({
      type: accountConnectionType,
      query: { accountId: '123456789012' },
      authMethods: ['account'],
    });
    void service.find({
      type: acmeConnectionType,
      query: {
        // @ts-expect-error - host-based lookups require a URL query
        accountId: '123456789012',
      },
      authMethods: ['token'],
    });
    // @ts-expect-error - the type does not declare a basic auth method
    void service.find({
      type: acmeConnectionType,
      query: { url: 'https://acme.test/project' },
      authMethods: ['basic'],
    });
    void service.find({
      // @ts-expect-error - only built-in types can be looked up by their key
      type: 'acme',
      query: { url: 'https://acme.test/project' },
    });

    expect(find).toHaveBeenCalledTimes(6);
  });
});
