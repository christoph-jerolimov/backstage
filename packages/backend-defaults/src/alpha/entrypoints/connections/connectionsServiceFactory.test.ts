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

import { createBackendPlugin } from '@backstage/backend-plugin-api';
import {
  connectionsServiceRef,
  connectionTypesRegistryServiceRef,
  declareConnection,
} from '@backstage/backend-plugin-api/alpha';
import {
  mockServices,
  ServiceFactoryTester,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { createConnectionType } from '@backstage/connections';
import { z } from 'zod/v4';
import { defaultServiceFactories } from '../../../CreateBackend';
import {
  connectionsServiceFactory,
  connectionTypesRegistryServiceFactory,
} from './connectionsServiceFactory';

describe('connectionsServiceFactory', () => {
  it('is installed by default and resolves plugin-scoped credentials', async () => {
    expect(defaultServiceFactories).toContain(connectionsServiceFactory);
    expect(connectionsServiceFactory.service).toBe(connectionsServiceRef);
    expect(connectionsServiceRef.id).toBe('alpha.core.connections');

    const tester = ServiceFactoryTester.from(connectionsServiceFactory, {
      dependencies: [
        mockServices.rootConfig.factory({
          data: {
            connections: [
              {
                type: 'github',
                host: 'github.com',
                auth: [
                  {
                    method: 'token',
                    token: 'catalog-token',
                    match: { plugins: ['catalog'] },
                  },
                  { method: 'token', token: 'default-token' },
                ],
              },
            ],
          },
        }),
      ],
    });
    const catalog = await tester.getSubject('catalog');
    const scaffolder = await tester.getSubject('scaffolder');

    await expect(
      catalog.find({
        type: 'github',
        query: { url: 'https://github.com/example/repo' },
        authMethods: ['token'],
      }),
    ).resolves.toMatchObject({
      host: 'github.com',
      auth: { method: 'token', token: 'catalog-token' },
    });
    await expect(
      scaffolder.find({
        type: 'github',
        query: { url: 'https://github.com/example/repo' },
        authMethods: ['token'],
      }),
    ).resolves.toMatchObject({
      auth: { method: 'token', token: 'default-token' },
    });
    const metadata = await catalog.find({
      type: 'github',
      query: { url: 'https://github.com/example/repo' },
    });
    expect(metadata).not.toHaveProperty('auth');
  });

  it('lets a plugin register and look up its own connection types', async () => {
    expect(defaultServiceFactories).toContain(
      connectionTypesRegistryServiceFactory,
    );
    expect(connectionTypesRegistryServiceFactory.service).toBe(
      connectionTypesRegistryServiceRef,
    );

    const jiraServerConnectionType = createConnectionType({
      type: 'jira:server',
      title: 'Jira Server',
      configSchema: z.object({ host: z.string() }),
      authMethods: [
        {
          method: 'token',
          title: 'Token',
          configSchema: z.object({ token: z.string() }),
        },
      ],
    });
    const logger = mockServices.rootLogger.mock();
    logger.child.mockReturnValue(logger);
    const found = jest.fn();

    await startTestBackend({
      features: [
        logger.factory,
        mockServices.rootConfig.factory({
          data: {
            connections: [
              {
                type: 'jira:server',
                host: 'jira.example.com',
                auth: [{ method: 'token', token: 'jira-token' }],
              },
              {
                type: 'missing:thing',
                host: 'thing.example.com',
                auth: [{ method: 'token', token: 'thing-token' }],
              },
            ],
          },
        }),
        createBackendPlugin({
          pluginId: 'jira',
          register(reg) {
            declareConnection(reg, { type: 'jira:server' });
            reg.registerInit({
              deps: {
                connections: connectionsServiceRef,
                connectionTypesRegistry: connectionTypesRegistryServiceRef,
              },
              async init({ connections, connectionTypesRegistry }) {
                connectionTypesRegistry.register(jiraServerConnectionType);
                found(
                  await connections.find({
                    type: jiraServerConnectionType,
                    query: { url: 'https://jira.example.com/browse/ABC-1' },
                    authMethods: ['token'],
                  }),
                );
              },
            });
          },
        }),
      ],
    });

    expect(found).toHaveBeenCalledWith({
      type: 'jira:server',
      title: 'Jira Server',
      host: 'jira.example.com',
      auth: { method: 'token', title: 'Token', token: 'jira-token' },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'Ignoring connections of type "missing:thing" in connections config, since no plugin in this backend has registered that connection type',
    );
    expect(logger.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('jira:server'),
    );
  });
});
