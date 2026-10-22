---
'@backstage/plugin-search': patch
---

The search modal, including the one opened from the sidebar search item, is now built with Backstage UI components instead of Material UI. The modal is rendered with the Backstage UI dialog and has a "Search" title with a close button, and the "View Full Results" action is a Backstage UI button. Custom modal content should be composed of the `DialogHeader`, `DialogBody`, and `DialogFooter` components from `@backstage/ui`. Added the new translation key `searchModal.title`.
