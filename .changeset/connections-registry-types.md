---
'@backstage/connections': patch
---

Added support for connection types that are defined outside of Backstage. Connection types can now be created with the new `createConnectionType` export and passed as the `type` when looking up connections with `ConnectionsService.find`. The new `ConnectionsRegistryService` interface describes the service that such types are registered with, and `buildConnectionsFromConfig` accepts additional `connectionTypes` along with an `onUnknownConnectionType` callback for deferring connections of types that are not known yet.
