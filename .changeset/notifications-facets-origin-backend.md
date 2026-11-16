---
'@backstage/plugin-notifications-backend': patch
---

Added an `origin` filter to the `/notifications` and `/topics` endpoints, and a new `/facets` endpoint that accepts the same filters as the notification list and returns the number of notifications for each origin, topic, severity, read status, and saved status.
