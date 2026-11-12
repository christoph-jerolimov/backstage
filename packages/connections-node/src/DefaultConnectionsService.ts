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
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';
import {
  connectionTypes as builtInConnectionTypes,
  type ConnectionsRegistryService,
  type ConnectionsService,
  type ConnectionTypeDefinition,
} from '@backstage/connections';
import type { ConfiguredConnection } from '@backstage/connections/config';
import { buildConnectionsFromConfig } from '@backstage/connections/config';
import { lookupStrategies } from './lookupStrategies';
import { InputError, NotAllowedError, NotFoundError } from '@backstage/errors';
import { JsonObject } from '@backstage/types';

// The identity field name is only known at runtime, so the typed connection
// object cannot be indexed directly; this helper contains the erased read.
function connectionIdentityOf(
  strategy: { identityField?: string },
  connection: object,
): string | undefined {
  if (!strategy.identityField) {
    return undefined;
  }
  const value = (connection as Record<string, unknown>)[strategy.identityField];
  return typeof value === 'string' ? value : undefined;
}

// A serialized form of everything that configuration and consumers can
// observe about a connection type. Two definitions with the same contract
// are interchangeable, for example when a package that exports a connection
// type has been installed in more than one version.
function contractOf(connectionType: ConnectionTypeDefinition): string {
  return JSON.stringify({
    title: connectionType.title,
    cardinality: connectionType.cardinality,
    lookupStrategy: connectionType.lookupStrategy,
    configSchema: connectionType.configSchema.schema().schema,
    authMethods: connectionType.authMethods.map(authMethod => ({
      method: authMethod.method,
      title: authMethod.title,
      configSchema: authMethod.configSchema.schema().schema,
    })),
  });
}

type ConnectionsSource = {
  getConnectionType(type: string): ConnectionTypeDefinition | undefined;
  getConnections(): ConfiguredConnection[];
};

class PluginConnectionsService implements ConnectionsService {
  private readonly logger: LoggerService;
  private readonly source: ConnectionsSource;

  constructor(logger: LoggerService, source: ConnectionsSource) {
    this.logger = logger;
    this.source = source;
  }

  async find(options: {
    type: string | ConnectionTypeDefinition;
    query: unknown;
    authMethods?: readonly string[];
  }): Promise<any> {
    const type =
      typeof options.type === 'string' ? options.type : options.type.type;
    const { query, authMethods } = options;

    const connectionType = this.source.getConnectionType(type);
    if (!connectionType) {
      throw new InputError(
        `Connection type "${type}" is not registered; register it with the connections registry service before looking up connections`,
      );
    }
    const strategy = lookupStrategies[connectionType.lookupStrategy];
    const identity = strategy.identityFromQuery(query);

    this.logger.debug(
      `Finding connection of type "${type}"${
        identity ? ` matching ${strategy.identityField} "${identity}"` : ''
      }`,
    );

    const connections = this.source.getConnections();
    let connection: ConfiguredConnection | undefined;
    if (identity !== undefined) {
      connection = connections.find(
        c => c.type === type && connectionIdentityOf(strategy, c) === identity,
      );
    } else {
      connection = connections.find(c => c.type === type);
    }

    if (!connection) {
      throw new NotFoundError(`Connection not found for type "${type}"`);
    }

    if (!authMethods) {
      const { auth: _, ...info } = connection;
      return info;
    }

    if (connection.auth.length === 0) {
      throw new NotAllowedError(
        `Connection of type "${type}"${
          identity ? ` for ${strategy.identityField} "${identity}"` : ''
        } has no auth method available to this plugin`,
      );
    }

    const matchAuth = (connectionType as any).matchAuth as
      | ((authMethods: any[], query: any) => any | undefined)
      | undefined;

    const selected = matchAuth
      ? matchAuth(connection.auth, query)
      : connection.auth[0];

    if (!selected) {
      throw new NotFoundError(`Connection not found for type "${type}"`);
    }

    if (!authMethods.includes(selected.method)) {
      throw new NotAllowedError(
        `Connection not found for type "${type}" with auth method "${selected.method}"`,
      );
    }

    this.logger.debug(
      `Selected connection of type "${type}"${
        identity ? ` for ${strategy.identityField} "${identity}"` : ''
      } using auth method "${selected.method}"`,
    );

    return {
      ...connection,
      auth: selected,
    };
  }
}

/** @public */
export class DefaultConnectionsService {
  private readonly logger: LoggerService;
  private readonly connections: ConfiguredConnection[];
  private readonly config: RootConfigService;
  // All known connection types, starting out with the built-in ones and
  // growing as plugins register their own.
  private readonly connectionTypes: Map<string, ConnectionTypeDefinition>;
  // Connections from config whose type is not known yet, keyed by type. These
  // are validated and loaded once a plugin registers their connection type.
  private readonly unregistered: Map<string, JsonObject[]>;

  private constructor(logger: LoggerService, config: RootConfigService) {
    this.logger = logger;
    this.config = config;
    this.connections = [];
    this.connectionTypes = new Map(Object.entries(builtInConnectionTypes));
    this.unregistered = new Map();
    this.#registerConnectionsFromConfig();
  }

  static create(options: {
    logger: LoggerService;
    config: RootConfigService;
  }): DefaultConnectionsService {
    return new DefaultConnectionsService(options.logger, options.config);
  }

  #registerConnectionsFromConfig(): void {
    this.connections.push(
      ...buildConnectionsFromConfig({
        config: this.config,
        logger: this.logger,
        onUnknownConnectionType: (type, connections) => {
          this.unregistered.set(type, connections);
        },
      }),
    );

    if (this.connections.length === 0) {
      return;
    }

    this.logger.info(
      `Loaded ${this.connections.length} connection${
        this.connections.length === 1 ? '' : 's'
      } from configuration`,
    );
  }

  #registerConnectionType(
    pluginId: string,
    connectionType: ConnectionTypeDefinition,
  ): void {
    const { type } = connectionType;

    const existing = this.connectionTypes.get(type);
    if (existing) {
      if (
        existing === connectionType ||
        contractOf(existing) === contractOf(connectionType)
      ) {
        return;
      }
      throw new InputError(
        `Plugin "${pluginId}" attempted to register connection type "${type}", but a different connection type is already registered with that key`,
      );
    }

    // The type is only added once its connections have been accepted, so that
    // every plugin that registers the type is told about invalid config.
    const pending = this.unregistered.get(type);
    if (pending) {
      const connections = buildConnectionsFromConfig({
        config: new ConfigReader({ connections: pending }),
        connectionTypes: [connectionType],
      });
      this.unregistered.delete(type);
      this.connections.push(...connections);
    }
    this.connectionTypes.set(type, connectionType);

    this.logger.info(
      `Plugin "${pluginId}" registered connection type "${type}" with ${
        pending?.length ?? 0
      } connection${pending?.length === 1 ? '' : 's'} from configuration`,
    );
  }

  #getConnectionsForPlugin(pluginId: string): ConfiguredConnection[] {
    // Filter connections and auth methods by plugin scope. Auth entries
    // explicitly matched to this plugin are ordered before unscoped entries
    // so that plugin-specific credentials take precedence.
    return this.connections.flatMap(connection => {
      if (connection.match && !connection.match.plugins.includes(pluginId)) {
        return [];
      }

      const pluginMatched = connection.auth.filter(a =>
        a.match?.plugins.includes(pluginId),
      );
      const unmatched = connection.auth.filter(a => !a.match);

      return [{ ...connection, auth: [...pluginMatched, ...unmatched] }];
    });
  }

  /**
   * Logs a warning for each connection type in the configuration that no
   * plugin has registered. Intended to be called once all plugins have had
   * the opportunity to register their connection types.
   */
  warnAboutUnregisteredConnectionTypes(): void {
    for (const [type, connections] of this.unregistered) {
      this.logger.warn(
        `Ignoring ${connections.length} connection${
          connections.length === 1 ? '' : 's'
        } of type "${type}" in connections config; it is not a built-in connection type and no plugin has registered it`,
      );
    }
  }

  registryForPlugin(pluginId: string): ConnectionsRegistryService {
    return {
      register: connectionType =>
        this.#registerConnectionType(pluginId, connectionType),
    };
  }

  forPlugin(
    pluginId: string,
    options?: {
      logger: LoggerService;
    },
  ): ConnectionsService {
    const logger = options?.logger ?? this.logger;
    // Connections are resolved at lookup time rather than up front, since
    // connection types can be registered after this service was created.
    return new PluginConnectionsService(logger, {
      getConnectionType: type => this.connectionTypes.get(type),
      getConnections: () => this.#getConnectionsForPlugin(pluginId),
    });
  }
}
