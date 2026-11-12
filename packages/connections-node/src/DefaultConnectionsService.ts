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
import type {
  Connection,
  ConnectionLookupStrategy,
  ConnectionsService,
  ConnectionTypeDefinition,
  ConnectionType,
  ConnectionTypesRegistryService,
  LookupConnectionType,
} from '@backstage/connections';
import type { ConfiguredConnection } from '@backstage/connections/config';
import {
  buildConnectionsFromConfig,
  buildPluginConnectionsFromConfig,
  getPluginConnectionTypesFromConfig,
} from '@backstage/connections/config';
import { getConnectionType, isConnectionType } from './lookup';
import { lookupStrategies } from './lookupStrategies';
import {
  ConflictError,
  InputError,
  NotAllowedError,
  NotFoundError,
} from '@backstage/errors';

// The part of a plugin-provided connection type that follows the
// `<pluginId>:` prefix.
const PLUGIN_TYPE_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

type ConnectionTypeInput = ConnectionType | ConnectionTypeDefinition;

type ConnectionQuery<TType extends ConnectionTypeInput> =
  LookupConnectionType<TType> extends ConnectionTypeDefinition<
    infer TDefinition
  >
    ? TDefinition['query']
    : never;

function getLookupStrategy<K extends ConnectionLookupStrategy>(
  name: K,
): (typeof lookupStrategies)[K] {
  return lookupStrategies[name];
}

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

function connectionTypeKey(type: string | { type: string }): string {
  return typeof type === 'string' ? type : type.type;
}

class PluginConnectionsService implements ConnectionsService {
  private readonly logger: LoggerService;
  private readonly getConnections: () => ConfiguredConnection[];
  private readonly resolveType: (
    type: string,
  ) => ConnectionTypeDefinition | undefined;

  constructor(
    logger: LoggerService,
    // Connections are read on every lookup, since plugins can register
    // further connection types after this service has been created.
    getConnections: () => ConfiguredConnection[],
    resolveType: (type: string) => ConnectionTypeDefinition | undefined,
  ) {
    this.logger = logger;
    this.getConnections = getConnections;
    this.resolveType = resolveType;
  }

  async find<
    TType extends ConnectionTypeInput,
    TAuthMethod extends LookupConnectionType<TType>['authMethods'][number]['method'],
  >(options: {
    type: TType;
    query: ConnectionQuery<TType>;
    authMethods?: readonly [TAuthMethod, ...TAuthMethod[]];
  }): Promise<
    Connection<TType, TAuthMethod> | Omit<Connection<TType>, 'auth'>
  > {
    const result = await this.findOptional(options);
    if (!result) {
      throw new NotFoundError(
        `Connection not found for type "${connectionTypeKey(options.type)}"`,
      );
    }
    return result;
  }

  private async findOptional<
    TType extends ConnectionTypeInput,
    TAuthMethod extends LookupConnectionType<TType>['authMethods'][number]['method'],
  >({
    type: typeInput,
    query,
    authMethods,
  }: {
    type: TType;
    query: ConnectionQuery<TType>;
    authMethods?: readonly [TAuthMethod, ...TAuthMethod[]];
  }): Promise<
    Connection<TType, TAuthMethod> | Omit<Connection<TType>, 'auth'> | undefined
  > {
    const type = connectionTypeKey(typeInput);
    const connectionType = this.resolveType(type);
    if (!connectionType) {
      throw new NotFoundError(
        `Connection type "${type}" is not registered; the plugin that provides it must register it with the connection types registry before it can be looked up`,
      );
    }
    const strategy = getLookupStrategy(connectionType.lookupStrategy);
    const identity = strategy.identityFromQuery(query);

    this.logger.debug(
      `Finding connection of type "${type}"${
        identity ? ` matching ${strategy.identityField} "${identity}"` : ''
      }`,
    );

    const connections = this.getConnections();
    let connection: ConfiguredConnection | undefined;
    if (identity !== undefined) {
      connection = connections.find(
        c => c.type === type && connectionIdentityOf(strategy, c) === identity,
      );
    } else {
      connection = connections.find(c => c.type === type);
    }

    if (!connection) {
      return undefined;
    }

    if (!authMethods) {
      const { auth: _, ...info } = connection;
      return info as Omit<Connection<TType>, 'auth'>;
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
      return undefined;
    }

    if (!(authMethods as readonly string[]).includes(selected.method)) {
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
    } as Connection<TType, TAuthMethod>;
  }
}

/** @public */
export class DefaultConnectionsService {
  private readonly logger: LoggerService;
  private readonly connections: ConfiguredConnection[];
  private readonly config: RootConfigService;
  private readonly pluginConnectionTypes = new Map<
    string,
    ConnectionTypeDefinition
  >();

  private constructor(logger: LoggerService, config: RootConfigService) {
    this.logger = logger;
    this.config = config;
    this.connections = [];
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

  forPlugin(
    pluginId: string,
    options?: {
      logger: LoggerService;
    },
  ): ConnectionsService {
    const logger = options?.logger ?? this.logger;
    return new PluginConnectionsService(
      logger,
      () => this.#getConnectionsForPlugin(pluginId),
      type => this.#resolveConnectionType(type),
    );
  }

  /**
   * Returns the registry through which the given plugin, and its modules,
   * contribute their own connection types.
   */
  registryForPlugin(
    pluginId: string,
    options?: {
      logger: LoggerService;
    },
  ): ConnectionTypesRegistryService {
    const logger = options?.logger ?? this.logger;
    return {
      register: connectionType => {
        this.#registerConnectionType(pluginId, connectionType, logger);
      },
    };
  }

  /**
   * Logs a warning for each plugin-provided connection type that is used in
   * configuration but that no plugin has registered. Call this once all
   * plugins have been initialized.
   */
  warnAboutUnregisteredConnectionTypes(): void {
    for (const type of getPluginConnectionTypesFromConfig(this.config)) {
      if (!this.pluginConnectionTypes.has(type)) {
        this.logger.warn(
          `Ignoring connections of type "${type}" in connections config, since no plugin in this backend has registered that connection type`,
        );
      }
    }
  }

  #resolveConnectionType(type: string): ConnectionTypeDefinition | undefined {
    if (isConnectionType(type)) {
      return getConnectionType(type);
    }
    return this.pluginConnectionTypes.get(type);
  }

  #registerConnectionType(
    pluginId: string,
    connectionType: ConnectionTypeDefinition,
    logger: LoggerService,
  ): void {
    const { type } = connectionType;
    const prefix = `${pluginId}:`;

    // The plugin ID prefix keeps plugin-provided types apart from both the
    // built-in types and the types of every other plugin.
    if (
      !type.startsWith(prefix) ||
      !PLUGIN_TYPE_NAME_PATTERN.test(type.slice(prefix.length))
    ) {
      throw new InputError(
        `Invalid connection type "${type}" registered by plugin "${pluginId}"; the type must be named "${prefix}<name>", where the name consists of lowercase letters and digits in groups separated by dashes`,
      );
    }
    if (this.pluginConnectionTypes.has(type)) {
      throw new ConflictError(
        `Connection type "${type}" has already been registered`,
      );
    }

    const connections = buildPluginConnectionsFromConfig({
      config: this.config,
      connectionType,
    });

    this.pluginConnectionTypes.set(type, connectionType);
    this.connections.push(...connections);

    logger.info(
      `Registered connection type "${type}" with ${
        connections.length
      } connection${connections.length === 1 ? '' : 's'} from configuration`,
    );
  }
}
