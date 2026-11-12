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
import { ConfigReader } from '@backstage/config';
import { JsonObject } from '@backstage/types';
import { z } from 'zod/v4';
import { createConnectionType } from '../system/createConnectionType';
import { buildConnectionsFromConfig } from './buildConnectionsFromConfig';

const rootConfig = (data: JsonObject) => new ConfigReader(data);

describe('buildConnectionsFromConfig', () => {
  let logger: {
    error: jest.Mock;
    warn: jest.Mock;
    info: jest.Mock;
    debug: jest.Mock;
  };

  beforeEach(() => {
    logger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
  });

  it('returns an empty list when nothing is configured, with or without a logger', () => {
    expect(buildConnectionsFromConfig({ config: rootConfig({}) })).toEqual([]);
    expect(
      buildConnectionsFromConfig({ config: rootConfig({}), logger }),
    ).toEqual([]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('converts legacy integrations, merges explicit connections, and assigns default titles', () => {
    const connections = buildConnectionsFromConfig({
      config: rootConfig({
        integrations: {
          github: [{ host: 'github.com', token: 'gh-token' }],
        },
        connections: [
          {
            type: 'gitlab',
            host: 'gitlab.com',
            auth: [{ method: 'token', token: 'gl-token' }],
          },
        ],
      }),
      logger,
    });

    expect(connections).toMatchObject([
      {
        type: 'github',
        host: 'github.com',
        title: 'GitHub',
        auth: [{ method: 'token', token: 'gh-token', title: 'Token' }],
      },
      {
        type: 'gitlab',
        host: 'gitlab.com',
        title: 'GitLab',
        auth: [{ method: 'token', token: 'gl-token', title: 'Token' }],
      },
    ]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('includes the identity in default titles when multiple connections share a type', () => {
    const connections = buildConnectionsFromConfig({
      config: rootConfig({
        connections: [
          {
            type: 'github',
            host: 'github.com',
            auth: [{ method: 'token', token: 'public' }],
          },
          {
            type: 'github',
            host: 'ghe.acme.com',
            title: 'Enterprise GitHub',
            auth: [{ method: 'token', token: 'enterprise' }],
          },
        ],
      }),
    });

    expect(connections.map(c => c.title)).toEqual([
      'GitHub (github.com)',
      'Enterprise GitHub',
    ]);
  });

  it('lets explicit connections shadow legacy entries of the same type, with a warning', () => {
    const connections = buildConnectionsFromConfig({
      config: rootConfig({
        integrations: {
          github: [{ host: 'ghe.acme.com', token: 'legacy-token' }],
        },
        connections: [
          {
            type: 'github',
            host: 'github.com',
            auth: [{ method: 'token', token: 'explicit-token' }],
          },
        ],
      }),
      logger,
    });

    expect(connections).toMatchObject([{ type: 'github', host: 'github.com' }]);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('legacy integrations of this type are ignored'),
    );
  });

  it('keeps the first legacy entry when duplicates resolve to the same connection, with a warning', () => {
    const connections = buildConnectionsFromConfig({
      config: rootConfig({
        integrations: {
          github: [
            { host: 'ghe.acme.com', token: 'first-token' },
            { host: 'ghe.acme.com', token: 'second-token' },
          ],
        },
      }),
      logger,
    });

    expect(connections).toMatchObject([
      {
        type: 'github',
        host: 'ghe.acme.com',
        auth: [{ method: 'token', token: 'first-token' }],
      },
    ]);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('github ghe.acme.com'),
    );
  });

  it('rejects invalid configuration with contextual error messages', () => {
    // Explicit connections that fail schema validation get connections
    // config context together with the prettified schema error.
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({
          connections: [
            { type: 'github', auth: [{ method: 'token', token: 't' }] },
          ],
        }),
      }),
    ).toThrow(
      /Invalid connection of type "github" in connections config:[\s\S]*host/,
    );

    // Legacy entries that fail conversion get legacy integrations context.
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({
          integrations: { awsS3: [{ endpoint: 'not a url' }] },
        }),
      }),
    ).toThrow(
      /Failed to convert legacy integrations config:[\s\S]*Invalid endpoint URL "not a url"/,
    );

    // The connections config must be a list.
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({ connections: { type: 'github' } }),
      }),
    ).toThrow('Expected "connections" config to be an array');

    // Explicit connections have a uniqueness requirement per identity, unlike
    // deduplicated legacy entries.
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({
          connections: [
            {
              type: 'github',
              host: 'github.com',
              auth: [{ method: 'token', token: 'one' }],
            },
            {
              type: 'github',
              host: 'github.com',
              auth: [{ method: 'token', token: 'two' }],
            },
          ],
        }),
      }),
    ).toThrow('Duplicate connection of type "github" for host "github.com"');

    // Singleton connection types allow at most one entry.
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({
          connections: [
            { type: 'aws', auth: [{ method: 'account', mainAccount: true }] },
            { type: 'aws', auth: [{ method: 'account', accountId: '123' }] },
          ],
        }),
      }),
    ).toThrow(
      'Duplicate connection of type "aws"; this is a singleton connection type',
    );
  });

  it('supports additional connection types and deferring unknown ones', () => {
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
    const acme = (host: string) => ({
      type: 'acme',
      host,
      auth: [{ method: 'token', token: `${host}-token` }],
    });
    const github = {
      type: 'github',
      host: 'github.com',
      auth: [{ method: 'token', token: 'gh-token' }],
    };

    // Without the type, its connections are rejected.
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({ connections: [github, acme('acme.com')] }),
      }),
    ).toThrow(
      /Invalid connection of type "acme" in connections config:[\s\S]*Unrecognised connection type acme/,
    );

    // Additional types get the same validation and defaults as built-in ones.
    expect(
      buildConnectionsFromConfig({
        config: rootConfig({
          connections: [github, acme('acme.com'), acme('acme.org')],
        }),
        connectionTypes: [acmeConnectionType],
      }),
    ).toMatchObject([
      { type: 'github', title: 'GitHub' },
      {
        type: 'acme',
        host: 'acme.com',
        title: 'Acme (acme.com)',
        auth: [{ method: 'token', token: 'acme.com-token', title: 'Token' }],
      },
      { type: 'acme', host: 'acme.org', title: 'Acme (acme.org)' },
    ]);
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({
          connections: [acme('acme.com'), { type: 'acme' }],
        }),
        connectionTypes: [acmeConnectionType],
      }),
    ).toThrow(/Invalid connection of type "acme" in connections config/);
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({
          connections: [acme('acme.com'), acme('acme.com')],
        }),
        connectionTypes: [acmeConnectionType],
      }),
    ).toThrow('Duplicate connection of type "acme" for host "acme.com"');

    // An additional type cannot take over the key of another type.
    expect(() =>
      buildConnectionsFromConfig({
        config: rootConfig({}),
        connectionTypes: [
          createConnectionType({
            type: 'github',
            title: 'Not GitHub',
            configSchema: z.object({ host: z.string() }),
            authMethods: [
              { method: 'none', title: 'None', configSchema: z.object({}) },
            ],
          }),
        ],
      }),
    ).toThrow('Connection type "github" is already defined');

    // Unknown types can be handed off instead of being rejected, without
    // being validated in any way.
    const onUnknownConnectionType = jest.fn();
    expect(
      buildConnectionsFromConfig({
        config: rootConfig({
          connections: [
            acme('acme.com'),
            github,
            { type: 'other', anything: true },
            acme('acme.org'),
          ],
        }),
        onUnknownConnectionType,
      }),
    ).toMatchObject([{ type: 'github' }]);
    expect(onUnknownConnectionType.mock.calls).toEqual([
      ['acme', [acme('acme.com'), acme('acme.org')]],
      ['other', [{ type: 'other', anything: true }]],
    ]);
  });
});
