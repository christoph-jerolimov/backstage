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
  connectionsRegistryServiceRef,
  connectionsServiceRef,
  declareConnection,
} from '@backstage/backend-plugin-api/alpha';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createConnectionType } from '@backstage/connections';
import { z } from 'zod/v4';
import {
  mockServices,
  ServiceFactoryTester,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { defaultServiceFactories } from '../../../CreateBackend';
import { connectionsRegistryServiceFactory } from './connectionsRegistryServiceFactory';
import { connectionsServiceFactory } from './connectionsServiceFactory';

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

  it('resolves connections of types registered by plugins', async () => {
    expect(defaultServiceFactories).toContain(
      connectionsRegistryServiceFactory,
    );
    expect(connectionsRegistryServiceFactory.service).toBe(
      connectionsRegistryServiceRef,
    );
    expect(connectionsRegistryServiceRef.id).toBe(
      'alpha.core.connectionsRegistry',
    );

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
      ],
    });
    const logger = mockServices.rootLogger.mock();
    logger.child.mockReturnValue(logger);
    const found: unknown[] = [];

    await startTestBackend({
      features: [
        logger.factory,
        mockServices.rootConfig.factory({
          data: {
            connections: [
              {
                type: 'artifactory',
                host: 'artifactory.example.com',
                auth: [{ method: 'token', token: 'secret' }],
              },
              { type: 'nexus', host: 'nexus.example.com', auth: [] },
            ],
          },
        }),
        createBackendPlugin({
          pluginId: 'owner',
          register(reg) {
            reg.registerInit({
              deps: { registry: connectionsRegistryServiceRef },
              async init({ registry }) {
                registry.register(artifactoryConnectionType);
              },
            });
          },
        }),
        createBackendPlugin({
          pluginId: 'consumer',
          register(reg) {
            declareConnection(reg, { type: 'artifactory' });
            reg.registerInit({
              deps: {
                connections: connectionsServiceRef,
                lifecycle: coreServices.lifecycle,
              },
              async init({ connections, lifecycle }) {
                lifecycle.addStartupHook(async () => {
                  const connection = await connections.find({
                    type: artifactoryConnectionType,
                    query: { url: 'https://artifactory.example.com/repo' },
                    authMethods: ['token'],
                  });
                  found.push(connection.auth.token);
                });
              },
            });
          },
        }),
      ],
    });

    expect(found).toEqual(['secret']);
    expect(logger.warn).toHaveBeenCalledWith(
      'Ignoring configured connections of type "nexus"; it is neither a built-in connection type nor registered with the connections registry',
    );
  });
});
