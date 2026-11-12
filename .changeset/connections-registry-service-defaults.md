---
'@backstage/backend-defaults': patch
---

Added the experimental `connectionsRegistryServiceFactory` to `@backstage/backend-defaults/alpha`, which is installed by default and lets plugins register their own connection types. As connection types can now be provided by plugins, a configured connection of an unknown type no longer prevents the backend from starting. Such connections are ignored, and a warning that names their type is logged once startup has completed.
