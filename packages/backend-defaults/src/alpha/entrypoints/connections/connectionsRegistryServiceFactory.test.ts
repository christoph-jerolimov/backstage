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
  coreServices,
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
  it('is installed by default and makes registered types available across plugins', async () => {
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

    await startTestBackend({
      features: [
        rootLogger.factory,
        mockServices.rootConfig.factory({
          data: {
            connections: [
              {
                type: 'acme',
                host: 'acme.com',
                auth: [
                  {
                    method: 'token',
                    token: 'module-token',
                    match: { plugins: ['consumer'] },
                  },
                  { method: 'token', token: 'default-token' },
                ],
              },
              { type: 'missing', host: 'missing.example.com' },
            ],
          },
        }),
        // A plugin that only provides the type, without using it.
        createBackendPlugin({
          pluginId: 'provider',
          register(reg) {
            reg.registerInit({
              deps: { connectionsRegistry: connectionsRegistryServiceRef },
              async init({ connectionsRegistry }) {
                connectionsRegistry.register(acmeConnectionType);
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
        // A module that registers the same type and looks up a connection.
        createBackendModule({
          pluginId: 'consumer',
          moduleId: 'acme',
          register(reg) {
            declareConnection(reg, { type: 'acme' });
            reg.registerInit({
              deps: {
                connections: connectionsServiceRef,
                connectionsRegistry: connectionsRegistryServiceRef,
                lifecycle: coreServices.rootLifecycle,
              },
              async init({ connections, connectionsRegistry }) {
                connectionsRegistry.register(acmeConnectionType);
                found.connection = await connections.find({
                  type: acmeConnectionType,
                  query: { url: 'https://acme.com/project' },
                  authMethods: ['token'],
                });
              },
            });
          },
        }),
      ],
    });

    expect(found.connection).toMatchObject({
      type: 'acme',
      host: 'acme.com',
      title: 'Acme',
      auth: { method: 'token', token: 'module-token', title: 'Token' },
    });

    // The backend starts despite the connection of a type that no plugin
    // registered, which is reported once startup has completed.
    expect(rootLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Ignoring 1 connection of type "missing"'),
    );
    expect(rootLogger.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('"acme"'),
    );
  });
});
