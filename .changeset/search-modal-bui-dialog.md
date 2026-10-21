---
'@backstage/plugin-search': patch
---

The search modal, including the one opened from the sidebar search item, is now rendered with the Backstage UI dialog instead of the Material UI dialog. It has a "Search" title with a close button, and custom modal content should be composed of the `DialogHeader`, `DialogBody`, and `DialogFooter` components from `@backstage/ui`. Added the new translation key `searchModal.title`.
