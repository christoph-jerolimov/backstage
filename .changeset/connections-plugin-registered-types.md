---
'@backstage/connections': patch
---

Added `createConnectionType` and the `ConnectionsRegistryService` contract, which let backend plugins define their own connection types. `ConnectionsService.find` now also accepts a connection type definition as its `type`, so that lookups of plugin-defined types are typed the same way as the built-in ones. `buildConnectionsFromConfig` accepts additional connection types to resolve configuration against.
