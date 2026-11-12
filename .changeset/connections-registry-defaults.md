---
'@backstage/backend-defaults': patch
'@backstage/backend-test-utils': patch
---

Backends created with `createBackend` and `startTestBackend` now provide the experimental connections registry service by default, which lets plugins and modules register their own connection types. Custom backends can install `connectionsRegistryServiceFactory` from `@backstage/backend-defaults/alpha`.

A connection in the `connections` configuration with a type that is not built in no longer prevents the connections service from starting. Such connections are loaded once a plugin registers their type, and a warning is logged at startup for each type that no plugin registered.
