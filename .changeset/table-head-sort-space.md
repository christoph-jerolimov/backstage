---
'@backstage/ui': patch
---

Fixed column titles in `Table` being truncated unnecessarily. The hidden sort indicator no longer reserves space in the column header; it only takes up space while it is shown on hover, on keyboard focus, or when the column is actively sorted.
