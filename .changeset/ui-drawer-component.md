---
'@backstage/ui': patch
---

Added a `Drawer` component that slides in from the left or right edge of the viewport and takes its full height. It mirrors the `Dialog` composition with `DrawerTrigger`, `DrawerHeader`, `DrawerBody`, and `DrawerFooter`. Use `placement` and `width` to position and size it. The drawer is modal by default; `hideBackdrop` keeps it modal without dimming the page, and `isNonModal` keeps the rest of the page interactive while it is open. Combine `isNonModal` with `isDismissable={false}` for a persistent side panel.

**Affected components:** Drawer
