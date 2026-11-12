---
'@backstage/backend-plugin-api': patch
---

Added an experimental `connectionsRegistryServiceRef` export to `@backstage/backend-plugin-api/alpha`. Plugins and modules can use it to register their own connection types, which can then be configured under `connections` and looked up through the connections service.
