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
import { z } from 'zod/v4';
import { InputError } from '@backstage/errors';
import type { Expand, JsonObject } from '@backstage/types';
import type {
  ConnectionTypeDefinition,
  ConnectionLookupStrategy,
  LookupStrategyQuery,
  PortableSchema,
  WithoutReservedAuthMethods,
  WithoutReservedFields,
} from '../api/ConnectionType';

/**
 * An auth method declaration passed to {@link createConnectionType}.
 *
 * @public
 */
export type ConnectionAuthMethodSchema<
  TMethod extends string = string,
  TConfigSchema extends z.ZodObject = z.ZodObject,
> = {
  method: TMethod;
  title: string;
  configSchema: TConfigSchema;
};

/**
 * The configuration shape inferred from a connection or auth method schema.
 *
 * @public
 */
export type ConfigFromSchema<TConfigSchema extends z.ZodObject> =
  z.infer<TConfigSchema> extends Record<string, never>
    ? Record<never, never>
    : z.infer<TConfigSchema>;

/**
 * The resolved auth entry shape for an auth method declaration.
 *
 * @remarks
 *
 * The intersection is flattened into a single object literal so that editor
 * tooltips show each auth method variant as a readable flat shape.
 *
 * @public
 */
export type ConfiguredConnectionAuthFromSchema<
  TAuthMethod extends ConnectionAuthMethodSchema,
> = TAuthMethod extends ConnectionAuthMethodSchema<
  infer TMethod,
  infer TConfigSchema
>
  ? Expand<{ method: TMethod } & ConfigFromSchema<TConfigSchema>>
  : never;

function createPortableSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  errorMessage: string,
): PortableSchema<z.infer<TSchema>, unknown> {
  let cachedJsonSchema: JsonObject | undefined;
  return {
    parse(input: unknown) {
      try {
        return schema.parse(input);
      } catch (cause) {
        if (cause instanceof z.ZodError) {
          throw new InputError(errorMessage, cause);
        }
        throw cause;
      }
    },
    schema() {
      if (!cachedJsonSchema) {
        cachedJsonSchema = schema.toJSONSchema({
          target: 'draft-07',
          io: 'input',
        }) as JsonObject;
      }
      return { schema: structuredClone(cachedJsonSchema) };
    },
  };
}

/**
 * Creates a connection type definition.
 *
 * @remarks
 *
 * The built-in connection types are created with this function. Backend
 * plugins and modules can use it to define additional connection types and
 * register them with the connections registry service. Pass the returned
 * definition as the `type` of `ConnectionsService.find` to get a fully typed
 * result for a registered connection type.
 *
 * @example
 *
 * ```ts
 * export const artifactoryConnectionType = createConnectionType({
 *   type: 'artifactory',
 *   title: 'Artifactory',
 *   configSchema: z.object({ host: z.string() }),
 *   authMethods: [
 *     {
 *       method: 'token',
 *       title: 'Token',
 *       configSchema: z.object({ token: z.string() }),
 *     },
 *   ],
 * });
 * ```
 *
 * @public
 */
export function createConnectionType<
  TType extends string,
  TConfigSchema extends z.ZodObject,
  const TAuthMethods extends readonly ConnectionAuthMethodSchema[],
  TLookupStrategy extends ConnectionLookupStrategy = 'host',
  TCardinality extends 'singleton' | 'multiton' = 'multiton',
>({
  configSchema,
  type,
  title,
  cardinality,
  lookupStrategy,
  authMethods,
  matchAuth,
  validate,
}: {
  /** The key used as `type` in configuration and in lookups. */
  type: TType;
  /** Human-readable name of the connection type. */
  title: string;
  /**
   * Whether configuration can hold one connection of this type or several.
   * Defaults to `'multiton'`.
   */
  cardinality?: TCardinality;
  /** How a lookup query identifies a connection. Defaults to `'host'`. */
  lookupStrategy?: TLookupStrategy;
  /** Schema for the connection fields shared by every auth method. */
  configSchema: WithoutReservedFields<TConfigSchema>;
  /** The supported auth methods. At least one is required. */
  authMethods: WithoutReservedAuthMethods<TAuthMethods>;
  /**
   * Selects the auth entry to return for a query. Defaults to the first
   * entry available to the requesting plugin.
   */
  matchAuth?: (
    authMethods: Expand<
      ConfiguredConnectionAuthFromSchema<TAuthMethods[number]> & {
        title: string;
      }
    >[],
    query: LookupStrategyQuery[TLookupStrategy],
  ) =>
    | Expand<
        ConfiguredConnectionAuthFromSchema<TAuthMethods[number]> & {
          title: string;
        }
      >
    | undefined;
  /**
   * Checks the connection as a whole once every schema has accepted its own
   * part, for rules like "only one entry may be the fallback" that no single
   * entry can verify. Entries include their plugin `match` so that rules can
   * take scoping into account. Throwing rejects the connection.
   */
  validate?: (connection: {
    config: ConfigFromSchema<TConfigSchema>;
    auth: readonly Expand<
      ConfiguredConnectionAuthFromSchema<TAuthMethods[number]> & {
        match?: { plugins: string[] };
      }
    >[];
  }) => void;
}): ConnectionTypeDefinition<{
  type: TType;
  cardinality: TCardinality;
  lookupStrategy: TLookupStrategy;
  query: LookupStrategyQuery[TLookupStrategy];
  configSchema: ConfigFromSchema<TConfigSchema>;
  auth: readonly ConfiguredConnectionAuthFromSchema<TAuthMethods[number]>[];
}> {
  const validatedAuthMethods = authMethods as TAuthMethods;
  if (validatedAuthMethods.length < 1) {
    throw new InputError(
      `Connection type "${type}" must declare at least one auth method`,
    );
  }
  const portableConfigSchema = createPortableSchema(
    (configSchema as unknown as TConfigSchema).strict(),
    `Invalid configuration for connection type "${type}"`,
  );

  return {
    type,
    title,
    cardinality: cardinality ?? 'multiton',
    lookupStrategy: lookupStrategy ?? 'host',
    authMethods: validatedAuthMethods.map(
      ({ method, title: authTitle, configSchema: authConfigSchema }) => ({
        method,
        title: authTitle,
        configSchema: createPortableSchema(
          authConfigSchema,
          `Invalid configuration for auth method "${method}" of connection type "${type}"`,
        ),
      }),
    ),
    configSchema: portableConfigSchema,
    matchAuth,
    validate,
  } as unknown as ConnectionTypeDefinition<{
    type: TType;
    cardinality: TCardinality;
    lookupStrategy: TLookupStrategy;
    query: LookupStrategyQuery[TLookupStrategy];
    configSchema: ConfigFromSchema<TConfigSchema>;
    auth: readonly ConfiguredConnectionAuthFromSchema<TAuthMethods[number]>[];
  }>;
}
