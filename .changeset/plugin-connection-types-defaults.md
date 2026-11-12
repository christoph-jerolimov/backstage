---
'@backstage/backend-defaults': patch
---

Added the alpha `connectionTypesRegistryServiceFactory`, which is installed by default and lets plugins register their own connection types. Entries in `connections` configuration with a type named `<pluginId>:<name>` are now validated when the plugin registers that type instead of being rejected at startup. If no installed plugin registers the type, the entries are ignored and a warning is logged after startup.
