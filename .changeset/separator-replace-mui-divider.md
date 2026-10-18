---
'@backstage/core-components': patch
'@backstage/plugin-org': patch
'@backstage/plugin-scaffolder': patch
'@backstage/plugin-scaffolder-react': patch
'@backstage/plugin-search': patch
---

Replaced the Material UI `Divider` with the Backstage UI `Separator` component where it was used as a plain horizontal line, such as in `InfoCard`, `TabbedCard`, `BottomLink`, the scaffolder template cards and editor, and the search modal.
