---
'@backstage/plugin-techdocs': patch
---

The TechDocs build logs panel is now rendered with the Backstage UI `Drawer` component. The unused `buildLogs.closeDrawer` translation message was removed; the drawer uses the shared close button of the `Drawer` header instead.
