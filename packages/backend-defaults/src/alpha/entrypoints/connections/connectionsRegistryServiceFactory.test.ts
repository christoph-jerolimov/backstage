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
  createBackendModule,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import {
  connectionsRegistryServiceRef,
  connectionsServiceRef,
  declareConnection,
} from '@backstage/backend-plugin-api/alpha';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { createConnectionType } from '@backstage/connections';
import { z } from 'zod/v4';
import { defaultServiceFactories } from '../../../CreateBackend';
import { connectionsRegistryServiceFactory } from './connectionsRegistryServiceFactory';

const acmeConnectionType = createConnectionType({
  type: 'acme',
  title: 'Acme',
  configSchema: z.object({ host: z.string() }),
  authMethods: [
    {
      method: 'token',
      title: 'Token',
      configSchema: z.object({ token: z.string() }),
    },
  ],
});

describe('connectionsRegistryServiceFactory', () => {
  it('is installed by default and makes registered types available to all plugins', async () => {
    expect(defaultServiceFactories).toContain(
      connectionsRegistryServiceFactory,
    );
    expect(connectionsRegistryServiceFactory.service).toBe(
      connectionsRegistryServiceRef,
    );
    expect(connectionsRegistryServiceRef.id).toBe(
      'alpha.core.connectionsRegistry',
    );

    const rootLogger = mockServices.rootLogger.mock();
    rootLogger.child.mockReturnValue(rootLogger);
    const found: Record<string, unknown> = {};

    // The module initializes before its plugin, and registers the shared
    // definition itself to not depend on the plugin having done so.
    const backend = await startTestBackend({
      features: [
        rootLogger.factory,
        mockServices.rootConfig.factory({
          data: {
            connections: [
              {
                type: 'acme',
                host: 'acme.test',
                auth: [
                  {
                    method: 'token',
                    token: 'module-token',
                    match: { plugins: ['consumer'] },
                  },
                  { method: 'token', token: 'default-token' },
                ],
              },
              {
                type: 'missing',
                host: 'missing.test',
                auth: [{ method: 'token', token: 'missing-token' }],
              },
            ],
          },
        }),
        createBackendPlugin({
          pluginId: 'acme',
          register(reg) {
            declareConnection(reg, { type: 'acme' });
            reg.registerInit({
              deps: {
                connectionsRegistry: connectionsRegistryServiceRef,
                connections: connectionsServiceRef,
              },
              async init({ connectionsRegistry, connections }) {
                connectionsRegistry.registerConnectionType(acmeConnectionType);
                found.plugin = await connections.find({
                  type: acmeConnectionType,
                  query: { url: 'https://acme.test/project' },
                  authMethods: ['token'],
                });
              },
            });
          },
        }),
        createBackendPlugin({
          pluginId: 'consumer',
          register(reg) {
            reg.registerInit({ deps: {}, async init() {} });
          },
        }),
        createBackendModule({
          pluginId: 'consumer',
          moduleId: 'acme',
          register(reg) {
            declareConnection(reg, { type: 'acme' });
            reg.registerInit({
              deps: {
                connectionsRegistry: connectionsRegistryServiceRef,
                connections: connectionsServiceRef,
              },
              async init({ connectionsRegistry, connections }) {
                connectionsRegistry.registerConnectionType(acmeConnectionType);
                found.module = await connections.find({
                  type: acmeConnectionType,
                  query: { url: 'https://acme.test/project' },
                  authMethods: ['token'],
                });
              },
            });
          },
        }),
      ],
    });

    expect(found).toEqual({
      plugin: expect.objectContaining({
        type: 'acme',
        title: 'Acme',
        host: 'acme.test',
        auth: { method: 'token', title: 'Token', token: 'default-token' },
      }),
      module: expect.objectContaining({
        host: 'acme.test',
        auth: expect.objectContaining({ token: 'module-token' }),
      }),
    });
    expect(rootLogger.warn).toHaveBeenCalledWith(
      'Ignoring configured connections of type "missing", as no connection type with that name is built in or has been registered by an installed plugin',
    );

    await backend.stop();
  });

  it('fails the registering plugin when its configured connections are invalid', async () => {
    await expect(
      startTestBackend({
        features: [
          mockServices.rootConfig.factory({
            data: {
              connections: [
                {
                  type: 'acme',
                  host: 'acme.test',
                  auth: [{ method: 'token' }],
                },
              ],
            },
          }),
          createBackendPlugin({
            pluginId: 'acme',
            register(reg) {
              reg.registerInit({
                deps: { connectionsRegistry: connectionsRegistryServiceRef },
                async init({ connectionsRegistry }) {
                  connectionsRegistry.registerConnectionType(
                    acmeConnectionType,
                  );
                },
              });
            },
          }),
        ],
      }),
    ).rejects.toThrow(
      /Invalid connection of type "acme" in connections config/,
    );
  });
});
