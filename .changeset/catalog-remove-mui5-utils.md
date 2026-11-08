---
'@backstage/plugin-catalog': patch
---

Removed the dependency on `@mui/utils`. The screen reader labels of the catalog table actions are now rendered with the `VisuallyHidden` component from `@backstage/ui`.
