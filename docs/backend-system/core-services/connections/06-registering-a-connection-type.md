---
id: registering-a-connection-type
title: Register a connection type from a plugin
description: Define a connection type in a backend plugin or module and register it with the connections registry
---

The [built-in connection types](./04-built-in-connection-types.md) cover
systems that many plugins share. A backend plugin or module can register an
additional [connection type](./01-concepts.md#connection-type) for a system
that has no built-in type. A registered type is configured under `connections`
and looked up through `ConnectionsService.find`, like a built-in type.

Prefer a built-in type when one exists. Registered types are meant for systems
that are specific to one plugin or one organization.

## Define the connection type

Create the definition with `createConnectionType` from
`@backstage/connections`. Export it from a package that every consumer can
import, such as the plugin's `-node` or `-common` package:

```ts title="plugins/artifactory-node/src/connectionType.ts"
import { createConnectionType } from '@backstage/connections';
import { z } from 'zod/v4';

export const artifactoryConnectionType = createConnectionType({
  type: 'artifactory',
  title: 'Artifactory',
  configSchema: z.object({
    host: z.string(),
  }),
  authMethods: [
    {
      method: 'token',
      title: 'Token',
      configSchema: z.object({
        token: z.string(),
      }),
    },
  ],
});
```

The options are the same as for a built-in type.
[Create or modify a connection type](./05-creating-a-connection-type.md)
describes the contract decisions, reserved fields, validation, and
authentication selection in detail.

The `type` key must not collide with a built-in type or with a type that
another plugin registers. Choose a key that identifies the external system.

## Register the connection type

Request the connections registry service and register the definition during
initialization:

```ts
import { createBackendPlugin } from '@backstage/backend-plugin-api';
import { connectionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { artifactoryConnectionType } from '@internal/plugin-artifactory-node';

export const artifactoryPlugin = createBackendPlugin({
  pluginId: 'artifactory',
  register(reg) {
    reg.registerInit({
      deps: {
        connectionsRegistry: connectionsRegistryServiceRef,
      },
      async init({ connectionsRegistry }) {
        connectionsRegistry.register(artifactoryConnectionType);
      },
    });
  },
});
```

`register` throws if the key is already in use. Register each type from one
plugin or module only.

The registry also lists the connection types known to the backend. Use
`getConnectionType` and `listConnectionTypes` to build tooling that works for
built-in and registered types alike.

## Configure connections of the type

After registration, adopters configure connections of the type like any other
connection:

```yaml title="app-config.yaml"
connections:
  - type: artifactory
    host: artifactory.example.com
    auth:
      - method: token
        token: ${ARTIFACTORY_TOKEN}
```

[Plugin scoping](./01-concepts.md#plugin-scoping), titles, cardinality, and
uniqueness rules apply in the same way as for built-in types.

## Look up connections of the type

[Declare the connection](./03-consuming-connections.md) with its key, then pass
the definition as `type` when calling `find`. The definition carries the
type information, so the query, the accepted authentication methods, and the
result are typed in the same way as for a built-in type:

```ts
import { createBackendPlugin } from '@backstage/backend-plugin-api';
import {
  connectionsServiceRef,
  declareConnection,
} from '@backstage/backend-plugin-api/alpha';
import { artifactoryConnectionType } from '@internal/plugin-artifactory-node';

export const examplePlugin = createBackendPlugin({
  pluginId: 'example',
  register(reg) {
    declareConnection(reg, { type: 'artifactory' });

    reg.registerInit({
      deps: { connections: connectionsServiceRef },
      async init({ connections }) {
        async function getToken(url: string) {
          const connection = await connections.find({
            type: artifactoryConnectionType,
            query: { url },
            authMethods: ['token'],
          });
          return connection.auth.token;
        }
        // Use getToken when handling requests or running tasks.
      },
    });
  },
});
```

Type keys on their own are only typed for the built-in types. A consumer that
cannot import the definition can pass the key with a cast and describe the
result itself:

```ts
import type { ConnectionType } from '@backstage/connections';

const connection = (await connections.find({
  type: 'artifactory' as ConnectionType,
  query: { url },
  authMethods: ['token'],
})) as unknown as { host: string; auth: { method: 'token'; token: string } };
```

## Understand startup behavior

Plugins register connection types while the backend starts, so the service
handles registered types differently from built-in types:

- Connections of a registered type are loaded and validated the first time
  that type is looked up. An invalid connection makes that lookup fail.
- `find` rejects with an `InputError` for a type that is not registered yet.
  Look up connections of a registered type when handling a request or running
  a task, or in a startup hook, rather than directly during initialization.
  This avoids depending on the order in which plugins initialize.
- When startup completes, the backend validates the configured connections of
  every registered type and logs any error. It logs a warning for configured
  connections whose type is neither built-in nor registered, and ignores them.
