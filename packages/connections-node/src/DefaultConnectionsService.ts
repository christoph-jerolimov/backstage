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
import {
  connectionTypes,
  type ConnectionLookupStrategy,
  type ConnectionsRegistryService,
  type ConnectionsService,
  type ConnectionTypeDefinition,
} from '@backstage/connections';
import type { ConfiguredConnection } from '@backstage/connections/config';
import { buildConnectionsFromConfig } from '@backstage/connections/config';
import { lookupStrategies } from './lookupStrategies';
import { InputError, NotAllowedError, NotFoundError } from '@backstage/errors';

const builtInConnectionTypes: ReadonlyMap<string, ConnectionTypeDefinition> =
  new Map(Object.entries(connectionTypes));

// The typing of lookups is carried entirely by the overloads of
// ConnectionsService; the implementation only sees the erased shape.
type FindOptions = {
  type: string | ConnectionTypeDefinition;
  query: unknown;
  authMethods?: readonly string[];
};

type ResolvedConnectionType = {
  connectionType: ConnectionTypeDefinition;
  connections: ConfiguredConnection[];
};

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

// Filter connections and auth methods by plugin scope. Auth entries
// explicitly matched to this plugin are ordered before unscoped entries
// so that plugin-specific credentials take precedence.
function filterConnectionsForPlugin(
  connections: ConfiguredConnection[],
  pluginId: string,
): ConfiguredConnection[] {
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

class PluginConnectionsService {
  private readonly logger: LoggerService;
  private readonly pluginId: string;
  private readonly resolve: (type: string) => ResolvedConnectionType;

  constructor(
    logger: LoggerService,
    pluginId: string,
    resolve: (type: string) => ResolvedConnectionType,
  ) {
    this.logger = logger;
    this.pluginId = pluginId;
    this.resolve = resolve;
  }

  async find(options: FindOptions): Promise<object> {
    // A registered connection type can be passed as its definition. Only its
    // key is used; the definition itself always comes from the registry.
    const type =
      typeof options.type === 'string' ? options.type : options.type?.type;
    const result = await this.findOptional({ ...options, type });
    if (!result) {
      throw new NotFoundError(`Connection not found for type "${type}"`);
    }
    return result;
  }

  private async findOptional({
    type,
    query,
    authMethods,
  }: FindOptions & { type: string }): Promise<object | undefined> {
    const resolved = this.resolve(type);
    const connectionType = resolved.connectionType;
    const connections = filterConnectionsForPlugin(
      resolved.connections,
      this.pluginId,
    );
    const strategy = getLookupStrategy(connectionType.lookupStrategy);
    const identity = strategy.identityFromQuery(query);

    this.logger.debug(
      `Finding connection of type "${type}"${
        identity ? ` matching ${strategy.identityField} "${identity}"` : ''
      }`,
    );

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
      return undefined;
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
  private readonly registry?: ConnectionsRegistryService;
  // Connections of registered types are built on first use, since plugins
  // can register their connection types at any point during startup.
  readonly #registeredConnections = new Map<
    ConnectionTypeDefinition,
    ConfiguredConnection[]
  >();

  private constructor(
    logger: LoggerService,
    config: RootConfigService,
    registry?: ConnectionsRegistryService,
  ) {
    this.logger = logger;
    this.config = config;
    this.registry = registry;
    this.connections = [];
    this.#registerConnectionsFromConfig();
  }

  static create(options: {
    logger: LoggerService;
    config: RootConfigService;
    /**
     * The registry holding connection types registered by plugins. Without
     * it only the built-in connection types are available, and a connection
     * of any other type in configuration is rejected.
     */
    registry?: ConnectionsRegistryService;
  }): DefaultConnectionsService {
    return new DefaultConnectionsService(
      options.logger,
      options.config,
      options.registry,
    );
  }

  #registerConnectionsFromConfig(): void {
    this.connections.push(
      ...buildConnectionsFromConfig({
        config: this.config,
        logger: this.logger,
        // Connections of other types are left for the registered connection
        // types, which may not have been registered yet.
        connectionTypes: this.registry
          ? [...builtInConnectionTypes.values()]
          : undefined,
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

  #resolveConnectionType(type: string): ResolvedConnectionType {
    const builtIn = builtInConnectionTypes.get(type);
    if (builtIn) {
      return { connectionType: builtIn, connections: this.connections };
    }

    const connectionType = this.registry?.getConnectionType(type);
    if (!connectionType) {
      throw new InputError(
        `Unknown connection type "${type}"; it is neither a built-in connection type nor registered with the connections registry`,
      );
    }

    let connections = this.#registeredConnections.get(connectionType);
    if (!connections) {
      connections = buildConnectionsFromConfig({
        config: this.config,
        logger: this.logger,
        connectionTypes: [connectionType],
      });
      this.#registeredConnections.set(connectionType, connections);
      this.logger.info(
        `Loaded ${connections.length} connection${
          connections.length === 1 ? '' : 's'
        } of registered type "${type}" from configuration`,
      );
    }
    return { connectionType, connections };
  }

  /**
   * Checks the configured connections whose type is not built-in, once all
   * plugins have had the chance to register their connection types.
   *
   * @remarks
   *
   * Connections of a registered type are validated, and a connection whose
   * type was never registered is reported, since it is otherwise ignored.
   * Problems are logged rather than thrown.
   */
  verifyConfiguredConnections(): void {
    const raw = this.config.getOptional('connections');
    if (!Array.isArray(raw)) {
      return;
    }

    const types = new Set<string>();
    for (const entry of raw) {
      const type = (entry as { type?: unknown } | null)?.type;
      if (typeof type === 'string' && !builtInConnectionTypes.has(type)) {
        types.add(type);
      }
    }

    for (const type of types) {
      if (!this.registry?.getConnectionType(type)) {
        this.logger.warn(
          `Ignoring configured connections of type "${type}"; it is neither a built-in connection type nor registered with the connections registry`,
        );
        continue;
      }
      try {
        this.#resolveConnectionType(type);
      } catch (error) {
        this.logger.error(String(error));
      }
    }
  }

  forPlugin(
    pluginId: string,
    options?: {
      logger: LoggerService;
    },
  ): ConnectionsService {
    const logger = options?.logger ?? this.logger;
    // The overloads of ConnectionsService cannot be expressed by a single
    // implementation signature, so the typing is applied here.
    return new PluginConnectionsService(logger, pluginId, type =>
      this.#resolveConnectionType(type),
    ) as unknown as ConnectionsService;
  }
}
