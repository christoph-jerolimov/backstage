---
'@backstage/plugin-catalog-react': patch
---

The filter panel that `CatalogFilterLayout.Filters` shows on small screens is now rendered with the Backstage UI `Drawer` component. The panel is non-modal and closes when interacting with the page behind it. Filters inside the panel are unmounted while it is closed; filter values are kept in the entity list state and in the URL as before.
