---
'@backstage/plugin-catalog-react': patch
---

Removed the dependencies on `@mui/material` and `material-ui-popup-state`. The `EntityPeekAheadPopover` component is now rendered with the Material UI v4 popover, matching the rest of the plugin.
