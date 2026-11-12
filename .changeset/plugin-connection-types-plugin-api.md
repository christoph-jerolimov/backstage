---
'@backstage/backend-plugin-api': minor
---

Added the alpha `connectionTypesRegistryServiceRef`, which lets a plugin or module register its own connection types. Registered types must be named `<pluginId>:<name>`, for example `jira:server`, and can then be used in `connections` configuration and looked up through the connections service like the built-in types.
