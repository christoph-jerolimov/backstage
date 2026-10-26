---
'@backstage/ui': patch
---

Fixed column titles in `Table` being truncated unnecessarily. The sort indicator of sortable columns now only takes up space while the column header is hovered, focused via keyboard, or actively sorted, so titles that fit the column stay fully visible.
