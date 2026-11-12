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
import { connectionTypes } from '../definitions/types';
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

  it('builds only the connections of the given connection types', () => {
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
    const artifactory = (host: string, token: string | number = 't') => ({
      type: 'artifactory',
      host,
      auth: [{ method: 'token', token }],
    });
    const config = (connections: JsonObject[]) =>
      rootConfig({
        integrations: { github: [{ host: 'github.com', token: 'legacy' }] },
        connections,
      });

    // Without the option, only built-in types are accepted
    expect(() =>
      buildConnectionsFromConfig({ config: config([artifactory('a.com')]) }),
    ).toThrow(/Unrecognised connection type artifactory/);

    // Built-in types skip entries that belong to other types
    expect(
      buildConnectionsFromConfig({
        config: config([artifactory('a.com')]),
        connectionTypes: Object.values(connectionTypes),
      }),
    ).toEqual([expect.objectContaining({ type: 'github', title: 'GitHub' })]);

    // A given type gets the same validation, titles, and uniqueness rules
    expect(
      buildConnectionsFromConfig({
        config: config([artifactory('a.com'), artifactory('b.com')]),
        connectionTypes: [artifactoryConnectionType],
      }),
    ).toEqual([
      {
        type: 'artifactory',
        title: 'Artifactory (a.com)',
        host: 'a.com',
        auth: [{ method: 'token', title: 'Token', token: 't' }],
      },
      {
        type: 'artifactory',
        title: 'Artifactory (b.com)',
        host: 'b.com',
        auth: [{ method: 'token', title: 'Token', token: 't' }],
      },
    ]);
    expect(() =>
      buildConnectionsFromConfig({
        config: config([artifactory('a.com', 1)]),
        connectionTypes: [artifactoryConnectionType],
      }),
    ).toThrow(/Invalid connection of type "artifactory" in connections config/);
    expect(() =>
      buildConnectionsFromConfig({
        config: config([artifactory('a.com'), artifactory('a.com')]),
        connectionTypes: [artifactoryConnectionType],
      }),
    ).toThrow(/Duplicate connection of type "artifactory" for host "a.com"/);
  });
});
