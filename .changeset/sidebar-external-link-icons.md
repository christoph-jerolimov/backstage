---
'@backstage/core-components': patch
---

`SidebarItem` now detects external links: an external link icon is shown next to the item text, and `http` and `https` URLs open in a new window by default. Pass `target` and `rel` to keep the previous behavior. `SidebarSubmenuItem` and its dropdown items, which already opened external links in a new window, now show the external link icon as well.
