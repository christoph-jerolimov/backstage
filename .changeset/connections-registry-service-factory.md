---
'@backstage/backend-defaults': minor
---

**BREAKING ALPHA**: Added the alpha `connectionsRegistryServiceFactory`, which is installed by default. The connections service now resolves connections of connection types that plugins register through the connections registry. Connections in configuration whose type is neither built-in nor registered are now reported with a warning once startup has completed and are ignored, rather than failing startup. Backends created with `createSpecializedBackend` that install `connectionsServiceFactory` must also install `connectionsRegistryServiceFactory`.
