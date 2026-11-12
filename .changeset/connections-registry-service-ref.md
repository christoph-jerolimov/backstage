---
'@backstage/backend-plugin-api': minor
---

Added the experimental `connectionsRegistryServiceRef` to `@backstage/backend-plugin-api/alpha`. Plugins and modules can use it to register their own connection types, which makes connections of those types configurable under `connections` and available through the connections service.
