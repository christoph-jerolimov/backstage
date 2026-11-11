---
'@backstage/backend-dynamic-feature-service': patch
---

Added the experimental `dynamicPlugins.http2FrontendAssets` option, which lets the built-in HTTP/2 server of `@backstage/backend-defaults` serve the frontend assets of dynamic plugins directly. It is disabled by default, requires `backend.http2` to be enabled, and accepts an `exclude` list of plugin package names whose assets should always be served by the backend.
