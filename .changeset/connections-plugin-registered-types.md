---
'@backstage/connections': patch
---

Backend plugins and modules can now define their own connection types. `createConnectionType` is now exported, and the new `ConnectionsRegistryService` type describes a registry for registering additional connection types and reading the built-in and registered ones. `ConnectionsService.find` accepts a connection type definition as `type`, which gives a registered connection type the same typed query, authentication methods, and result as the built-in types. `buildConnectionsFromConfig` accepts a new `connectionTypes` option for building the connections of a specific set of connection types.
