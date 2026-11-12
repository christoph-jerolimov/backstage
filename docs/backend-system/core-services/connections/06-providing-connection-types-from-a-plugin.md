---
id: providing-connection-types-from-a-plugin
title: Provide connection types from a plugin
description: Register plugin-specific connection types with the connection types registry
---

A backend plugin can provide its own
[connection types](./01-concepts.md#connection-type) for external systems that
the framework has no [built-in type](./04-built-in-connection-types.md) for.
Adopters configure these types under `connections` in the same way as built-in
types, and plugins look them up through the same
[connection service](./01-concepts.md#connection-service).

A plugin registers its types with the connection types registry service,
similar to how a plugin registers actions with the
[actions registry](../actions-registry.md).

:::caution[Experimental]
The connection types registry is experimental. Import
`connectionTypesRegistryServiceRef` from `@backstage/backend-plugin-api/alpha`.
:::

## Name the connection type

A plugin-provided connection type must be named `<pluginId>:<name>`, for
example `jira:server` for a type that the `jira` plugin provides. The name
after the colon uses lowercase letters and digits, in groups separated by
dashes.

The plugin ID prefix prevents conflicts:

- Built-in type keys never contain a colon, so a plugin-provided type cannot
  conflict with a current or future built-in type.
- A plugin can only register types that start with its own plugin ID, so two
  plugins cannot register the same type.

A module registers types under the ID of the plugin that it extends.

## Define the connection type

Define the type with `createConnectionType` from `@backstage/connections`.
Place the definition in a package that every consumer can import, such as the
plugin's node library, because consumers pass the definition to
`ConnectionsService.find`.

```ts title="plugins/jira-node/src/connectionTypes.ts"
import { createConnectionType } from '@backstage/connections';
import { z } from 'zod/v4';

export const jiraServerConnectionType = createConnectionType({
  type: 'jira:server',
  title: 'Jira Server',
  configSchema: z.object({
    host: z.string(),
    apiBaseUrl: z.string().optional(),
  }),
  authMethods: [
    {
      method: 'token',
      title: 'Token',
      configSchema: z.object({
        token: z.string(),
      }),
    },
    {
      method: 'basic',
      title: 'Basic',
      configSchema: z.object({
        username: z.string(),
        password: z.string(),
      }),
    },
  ],
});
```

Schemas use Zod 4 through the `zod/v4` import. The options are the same as for
built-in types. See
[Create or modify a connection type](./05-creating-a-connection-type.md) for
[cardinality](./01-concepts.md#cardinality),
[lookup strategies](./01-concepts.md#lookup-strategies), reserved fields,
authentication selection with `matchAuth`, and whole-connection validation
with `validate`.

## Register and consume the type

Register the type during plugin initialization, and add a
[connection declaration](./01-concepts.md#connection-declaration) for it like
for any other type that the plugin consumes:

```ts title="plugins/jira-backend/src/plugin.ts"
import { createBackendPlugin } from '@backstage/backend-plugin-api';
import {
  connectionsServiceRef,
  connectionTypesRegistryServiceRef,
  declareConnection,
} from '@backstage/backend-plugin-api/alpha';
import { jiraServerConnectionType } from '@internal/plugin-jira-node';

export const jiraPlugin = createBackendPlugin({
  pluginId: 'jira',
  register(env) {
    declareConnection(env, {
      type: jiraServerConnectionType.type,
      description: 'Reads issues from Jira Server',
    });

    env.registerInit({
      deps: {
        connections: connectionsServiceRef,
        connectionTypesRegistry: connectionTypesRegistryServiceRef,
      },
      async init({ connections, connectionTypesRegistry }) {
        connectionTypesRegistry.register(jiraServerConnectionType);

        const connection = await connections.find({
          type: jiraServerConnectionType,
          query: { url: 'https://jira.example.com/browse/ABC-1' },
          authMethods: ['token'],
        });

        // The result is typed from the definition.
        const { host, auth } = connection;
        // ...
      },
    });
  },
});
```

Pass the definition, not the type string, as `type` when calling `find`. The
query, the accepted authentication methods, and the returned connection are
inferred from the definition.

Registration validates every entry of that type in the `connections`
configuration. `register` throws when an entry is invalid, which fails the
initialization of the plugin in the same way as invalid configuration for a
built-in type fails backend startup. Registering the same type twice, or a
type that does not start with the ID of the calling plugin, also throws.

### Consume a type from another plugin

Another plugin or module can consume the type by importing the definition,
declaring the type, and calling `find`. It does not register the type again.

```ts
declareConnection(env, { type: jiraServerConnectionType.type });
```

A lookup rejects with `NotFoundError` until the providing plugin has
registered the type. Plugins initialize concurrently, so look up a type from
another plugin when a request or task needs it rather than during
initialization.

## Configure the type

Adopters configure a plugin-provided type with its full type name. The
framework fields `type`, `title`, `match`, and `auth` work in the same way as
for built-in types, including [plugin scoping](./01-concepts.md#plugin-scoping).

```yaml title="app-config.yaml"
connections:
  - type: jira:server
    host: jira.example.com
    auth:
      - method: token
        token: ${JIRA_TOKEN}
```

Document the type name, connection fields, and authentication methods in the
plugin's documentation, because plugin-provided types are not listed with the
built-in types.

Entries of a type that no installed plugin registers are ignored. The backend
logs a warning for each such type after startup, which makes a misspelled type
name visible while still allowing several backend deployments with different
plugins to share one configuration.
