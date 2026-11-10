---
'@backstage/backend-defaults': patch
---

Added experimental HTTP/2 support for the backend, enabled with the new `backend.http2` configuration. It requires `backend.https` to be configured. A built-in HTTP/2 server, which also accepts HTTP/1.1, listens on the configured address and forwards requests to the backend, and can serve static files such as the app's `static` folder directly. See the [root HTTP router documentation](https://backstage.io/docs/backend-system/core-services/root-http-router#serving-http2) for details.
