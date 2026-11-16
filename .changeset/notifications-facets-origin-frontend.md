---
'@backstage/plugin-notifications': patch
---

Added an origin filter to the notifications page for showing only the notifications sent by a specific plugin or external service. The notifications API client also supports the new `origin` option and has a new `getFacets` method that returns the number of notifications for each filter value.

**BREAKING PRODUCERS**: Custom implementations and test mocks of `NotificationsApi` must implement the new `getFacets` method.
