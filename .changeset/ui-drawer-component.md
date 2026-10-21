---
'@backstage/ui': patch
---

Added a `Drawer` component that slides in from an edge of the viewport. It mirrors the `Dialog` composition with `DrawerTrigger`, `DrawerHeader`, `DrawerBody`, and `DrawerFooter`. Use `placement` to open it from the left, right, top, bottom, or the locale aware start and end; left and right drawers take the full viewport height and are sized with `width`, top and bottom drawers take the full viewport width and are sized with `height`. The drawer is modal by default and built on the React Aria `Sheet`, so it can be swiped away on touch screens and supports `snapPoints`. `hideBackdrop` keeps it modal without dimming the page, and `isNonModal` keeps the rest of the page interactive while it is open. Combine `isNonModal` with `isDismissable={false}` for a persistent side panel that only closes through its own controls.

**Affected components:** Drawer
