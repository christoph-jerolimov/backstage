---
'@backstage/connections': patch
---

Plugins can now provide their own connection types. `createConnectionType` is exported for defining a type, and the new `ConnectionTypesRegistryService` describes the registry that plugins register their types with. Plugin-provided types must be named `<pluginId>:<name>`, for example `jira:server`, which keeps them apart from the built-in types and from the types of other plugins. `ConnectionsService.find` accepts the definition of a plugin-provided type as `type`, with the query and result inferred from it.

`buildConnectionsFromConfig` now skips entries of plugin-provided types. The new `buildPluginConnectionsFromConfig` and `getPluginConnectionTypesFromConfig` exports from `@backstage/connections/config` handle those entries.
