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
import { connectionTypes } from '@backstage/connections';
import type {
  Connection,
  ConnectionLookupStrategy,
  ConnectionsRegistryService,
  ConnectionsService,
  ConnectionTypeDefinition,
  ConnectionType,
  LookupConnectionType,
} from '@backstage/connections';
import type { ConfiguredConnection } from '@backstage/connections/config';
import { buildConnectionsFromConfig } from '@backstage/connections/config';
import { lookupStrategies } from './lookupStrategies';
import {
  ConflictError,
  InputError,
  NotAllowedError,
  NotFoundError,
} from '@backstage/errors';

const builtInConnectionTypes: ReadonlyMap<string, ConnectionTypeDefinition> =
  new Map(Object.entries(connectionTypes));

type ConnectionQuery<TType extends ConnectionType | ConnectionTypeDefinition> =
  LookupConnectionType<TType> extends ConnectionTypeDefinition<
    infer TDefinition
  >
    ? TDefinition['query']
    : never;

function connectionTypeKeyOf(
  type: ConnectionType | ConnectionTypeDefinition,
): string {
  return typeof type === 'string' ? type : type.type;
}

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

// A definition that was created by an incompatible version of the
// connections package would otherwise only fail once a connection is looked
// up, so the parts that lookups rely on are checked at registration.
function assertConnectionTypeDefinition(
  connectionType: ConnectionTypeDefinition,
): void {
  const candidate = connectionType as Partial<ConnectionTypeDefinition> | null;
  if (
    typeof candidate !== 'object' ||
    candidate === null ||
    typeof candidate.type !== 'string' ||
    candidate.type === '' ||
    typeof candidate.configSchema?.parse !== 'function' ||
    !Array.isArray(candidate.authMethods)
  ) {
    throw new InputError(
      'Invalid connection type, expected a definition created with createConnectionType',
    );
  }
  if (!Object.hasOwn(lookupStrategies, candidate.lookupStrategy ?? '')) {
    throw new InputError(
      `Connection type "${candidate.type}" uses the unsupported lookup strategy "${candidate.lookupStrategy}"`,
    );
  }
}

// The view of the shared connections state that plugin-scoped services read
// from. Both the connection types and the connections change as plugins
// register connection types, so they are read anew for every lookup.
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

  async find<
    TType extends ConnectionType | ConnectionTypeDefinition,
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
        `Connection not found for type "${connectionTypeKeyOf(options.type)}"`,
      );
    }
    return result;
  }

  private async findOptional<
    TType extends ConnectionType | ConnectionTypeDefinition,
    TAuthMethod extends LookupConnectionType<TType>['authMethods'][number]['method'],
  >({
    type: typeOrDefinition,
    query,
    authMethods,
  }: {
    type: TType;
    query: ConnectionQuery<TType>;
    authMethods?: readonly [TAuthMethod, ...TAuthMethod[]];
  }): Promise<
    Connection<TType, TAuthMethod> | Omit<Connection<TType>, 'auth'> | undefined
  > {
    const type = connectionTypeKeyOf(typeOrDefinition);
    const connectionType = this.source.getConnectionType(type);
    if (!connectionType) {
      throw new InputError(
        `Connection type "${type}" is not registered. Register it with the connections registry service before looking up connections of this type.`,
      );
    }
    const strategy = getLookupStrategy(connectionType.lookupStrategy);
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
  private readonly config: RootConfigService;
  private readonly registeredTypes = new Map<
    string,
    { connectionType: ConnectionTypeDefinition; pluginId: string }
  >();
  private connections: ConfiguredConnection[];
  private unregisteredTypes: Set<string>;

  private constructor(logger: LoggerService, config: RootConfigService) {
    this.logger = logger;
    this.config = config;

    const { connections, unregisteredTypes } = this.#buildConnections({
      connectionTypes: [],
      logger,
    });
    this.connections = connections;
    this.unregisteredTypes = unregisteredTypes;

    if (connections.length > 0) {
      this.logger.info(
        `Loaded ${connections.length} connection${
          connections.length === 1 ? '' : 's'
        } from configuration`,
      );
    }
  }

  static create(options: {
    logger: LoggerService;
    config: RootConfigService;
  }): DefaultConnectionsService {
    return new DefaultConnectionsService(options.logger, options.config);
  }

  // Resolves the complete configuration against the built-in connection types
  // and the given additional ones. Connections of any other type are left
  // out, and reported back so that they can be resolved once a plugin
  // registers their connection type.
  #buildConnections(options: {
    connectionTypes: ConnectionTypeDefinition[];
    logger?: LoggerService;
  }): { connections: ConfiguredConnection[]; unregisteredTypes: Set<string> } {
    const unregisteredTypes = new Set<string>();
    const connections = buildConnectionsFromConfig({
      config: this.config,
      logger: options.logger,
      connectionTypes: options.connectionTypes,
      onUnknownType: type => unregisteredTypes.add(type),
    });
    return { connections, unregisteredTypes };
  }

  #getConnectionType(type: string): ConnectionTypeDefinition | undefined {
    return (
      builtInConnectionTypes.get(type) ??
      this.registeredTypes.get(type)?.connectionType
    );
  }

  #registerConnectionType(
    connectionType: ConnectionTypeDefinition,
    pluginId: string,
    logger: LoggerService,
  ): void {
    assertConnectionTypeDefinition(connectionType);
    const { type } = connectionType;

    if (builtInConnectionTypes.has(type)) {
      throw new ConflictError(
        `Plugin "${pluginId}" attempted to register the connection type "${type}", which is a built-in connection type`,
      );
    }

    const existing = this.registeredTypes.get(type);
    if (existing) {
      // Plugins and modules that share a connection type each register it, so
      // that none of them depends on the initialization order of the others.
      if (existing.connectionType === connectionType) {
        return;
      }
      throw new ConflictError(
        `Plugin "${pluginId}" attempted to register the connection type "${type}", which plugin "${existing.pluginId}" has already registered with a different definition`,
      );
    }

    // The configuration is resolved again in full, rather than only for the
    // new type, to keep a single pipeline for validation, uniqueness checks,
    // and default titles. The logger is left out as the outcome for all other
    // types is unchanged and has already been reported. If the configuration
    // of the new type is invalid this throws, leaving the state untouched.
    const { connections, unregisteredTypes } = this.#buildConnections({
      connectionTypes: [
        ...Array.from(this.registeredTypes.values(), r => r.connectionType),
        connectionType,
      ],
    });

    this.registeredTypes.set(type, { connectionType, pluginId });
    this.connections = connections;
    this.unregisteredTypes = unregisteredTypes;

    const count = connections.filter(c => c.type === type).length;
    logger.info(
      `Registered connection type "${type}" and loaded ${count} connection${
        count === 1 ? '' : 's'
      } of that type from configuration`,
    );
  }

  #getConnectionsForPlugin(
    connections: ConfiguredConnection[],
    pluginId: string,
  ): ConfiguredConnection[] {
    // Filter connections and auth methods by plugin scope. Auth entries
    // explicitly matched to this plugin are ordered before unscoped entries
    // so that plugin-specific credentials take precedence.
    return connections.flatMap(connection => {
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
   * Returns the types of the connections in configuration that are not
   * available because no plugin has registered their connection type.
   */
  getUnregisteredConnectionTypes(): string[] {
    return Array.from(this.unregisteredTypes);
  }

  forPlugin(
    pluginId: string,
    options?: {
      logger: LoggerService;
    },
  ): ConnectionsService {
    const logger = options?.logger ?? this.logger;

    // The plugin's view is only filtered again once the shared connections
    // have been replaced, which happens when a connection type is registered.
    let scoped:
      | { from: ConfiguredConnection[]; connections: ConfiguredConnection[] }
      | undefined;

    return new PluginConnectionsService(logger, {
      getConnectionType: type => this.#getConnectionType(type),
      getConnections: () => {
        if (scoped?.from !== this.connections) {
          scoped = {
            from: this.connections,
            connections: this.#getConnectionsForPlugin(
              this.connections,
              pluginId,
            ),
          };
        }
        return scoped.connections;
      },
    });
  }

  registryForPlugin(
    pluginId: string,
    options?: {
      logger: LoggerService;
    },
  ): ConnectionsRegistryService {
    const logger = options?.logger ?? this.logger;
    return {
      registerConnectionType: connectionType =>
        this.#registerConnectionType(connectionType, pluginId, logger),
    };
  }
}
