---
id: registering-a-connection-type
title: Register a connection type from a plugin
description: Define a connection type in a backend plugin and register it with the connections registry service
---

A backend plugin or module can register its own
[connection type](./01-concepts.md#connection-type) when the external system it
talks to has no [built-in type](./04-built-in-connection-types.md). Adopters
then configure connections of that type in the root `connections` array, next
to the built-in ones, and the plugin looks them up through the
[connection service](./01-concepts.md#connection-service).

:::caution[Experimental service]
The connections registry service is experimental. Import
`connectionsRegistryServiceRef` from `@backstage/backend-plugin-api/alpha`,
and `createConnectionType` from `@backstage/connections`.
:::

Registering a type gives a plugin the same behavior that the built-in types
have: schema validation at startup, unique connection identities, default
titles, [plugin scoping](./01-concepts.md#plugin-scoping), and typed lookups.

Prefer a built-in type when one exists for the external system. If the system
is widely used across the Backstage ecosystem, consider
[contributing a built-in type](./05-creating-a-connection-type.md) instead, so
that every plugin shares one definition.

## Define the connection type

Define the type with `createConnectionType`, in a package that every consumer
of the type can import. A node library is a good fit when more than one plugin
or module uses the type.

Schemas are declared with Zod v4, imported from `zod/v4`:

```ts title="plugins/acme-node/src/acmeConnectionType.ts"
import { createConnectionType } from '@backstage/connections';
import { z } from 'zod/v4';

export const acmeConnectionType = createConnectionType({
  type: 'acme',
  title: 'Acme',
  configSchema: z.object({
    host: z.string(),
    apiBaseUrl: z.string().optional(),
  }),
  authMethods: [
    {
      method: 'none',
      title: 'None',
      configSchema: z.object({}),
    },
    {
      method: 'token',
      title: 'Token',
      configSchema: z.object({
        token: z.string(),
      }),
    },
  ],
  matchAuth(authMethods) {
    return (
      authMethods.find(auth => auth.method === 'token') ??
      authMethods.find(auth => auth.method === 'none')
    );
  },
});
```

The options are the same as for the built-in types. See
[Create or modify a connection type](./05-creating-a-connection-type.md#define-the-contract)
for how to choose the type key, cardinality, lookup strategy, fields,
authentication methods, and selection and validation logic.

Choose a type key that is unlikely to be used by another plugin, such as the
name of the external system. A key identifies one definition for the whole
backend, and the key of a built-in type cannot be reused.

## Register and consume the type

Request the connections registry service and register the type during
initialization. The plugin still adds a
[connection declaration](./01-concepts.md#connection-declaration) for the type,
and passes the definition as the `type` of a lookup:

```ts title="plugins/acme-backend/src/plugin.ts"
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import {
  connectionsRegistryServiceRef,
  connectionsServiceRef,
  declareConnection,
} from '@backstage/backend-plugin-api/alpha';
import { acmeConnectionType } from '@internal/plugin-acme-node';

export const acmePlugin = createBackendPlugin({
  pluginId: 'acme',
  register(reg) {
    declareConnection(reg, {
      type: acmeConnectionType.type,
      description: 'Reads project metadata from Acme',
    });

    reg.registerInit({
      deps: {
        connectionsRegistry: connectionsRegistryServiceRef,
        connections: connectionsServiceRef,
        logger: coreServices.logger,
      },
      async init({ connectionsRegistry, connections, logger }) {
        connectionsRegistry.registerConnectionType(acmeConnectionType);

        const connection = await connections.find({
          type: acmeConnectionType,
          query: { url: 'https://acme.example.com/projects/backstage' },
          authMethods: ['none', 'token'],
        });
        logger.info(`Resolved Acme connection for ${connection.host}`);
      },
    });
  },
});
```

Passing the definition lets TypeScript infer the query, the connection fields,
and the returned authentication value, the same way a built-in type key does.
In this example `connection.host` is a `string`, and `connection.auth` is
narrowed by `connection.auth.method`. Use `Connection<typeof acmeConnectionType, 'token'>`
to type a helper that accepts a resolved connection.

Backends created with `createBackend` from `@backstage/backend-defaults`
include the default connections registry service, as do tests using
`startTestBackend`. Custom backends using `createSpecializedBackend` can
install `connectionsRegistryServiceFactory` from
`@backstage/backend-defaults/alpha`.

## Configure connections of the type

Once the plugin is installed, adopters configure the type in the same place
and format as the built-in types:

```yaml title="app-config.yaml"
connections:
  - type: acme
    host: acme.example.com
    auth:
      - method: token
        token: ${ACME_TOKEN}
```

Everything in
[Configure and manage connections](./02-configuring-connections.md) applies,
including multiple endpoints, multiple authentication entries, and `match`
rules. Document the connection fields and authentication methods of your type
for the adopters of your plugin.

Registration validates the connections of the type that are present in
configuration. If one of them is invalid, `registerConnectionType` throws an
error that names the type and the failing field, which fails the
initialization of the registering plugin.

## Share a type between plugins and modules

Connection types are registered for the whole backend. Any plugin or module
can look up connections of a type that another plugin has registered, subject
to its own declaration and to [plugin scoping](./01-concepts.md#plugin-scoping).

A lookup fails with an `InputError` until the type has been registered.
Plugins initialize in no particular order relative to each other, so do not
rely on another plugin having registered the type first. Instead, have each
plugin and module that uses the type during initialization register it:

```ts
async init({ connectionsRegistry, connections }) {
  connectionsRegistry.registerConnectionType(acmeConnectionType);
  // Lookups of the type are now safe, whichever plugin initialized first.
}
```

Registering the same definition more than once is allowed. Registration fails
with a `ConflictError` when:

- The key belongs to a built-in connection type.
- A different definition has already been registered for the key. This can
  happen when two unrelated plugins choose the same key, or when two copies of
  the package that defines the type are installed.

## Connections without a registered type

A configured connection whose type is neither built in nor registered is not
available to any plugin. Because plugins register types as they initialize,
the backend can only tell once startup has completed. It then logs a warning
that names each type:

```text
Ignoring configured connections of type "acme", as no connection type with that name is built in or has been registered by an installed plugin
```

The backend keeps running, which lets several backends with different plugins
share one configuration file. If you see this warning for a type you expect to
work, check the spelling of `type` and that the plugin providing the type is
installed in this backend.

## Test the type

Test the plugin with `startTestBackend`, which includes both connections
services, and supply connections through mock root configuration:

```ts
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';

await startTestBackend({
  features: [
    acmePlugin,
    mockServices.rootConfig.factory({
      data: {
        connections: [
          {
            type: 'acme',
            host: 'acme.example.com',
            auth: [{ method: 'token', token: 'test-token' }],
          },
        ],
      },
    }),
  ],
});
```

Cover the cases listed in
[Create or modify a connection type](./05-creating-a-connection-type.md#test-the-type)
that apply to your type, such as invalid configuration and authentication
selection.
