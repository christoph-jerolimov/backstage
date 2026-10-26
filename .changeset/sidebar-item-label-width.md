---
'@backstage/core-components': patch
---

Sidebar item titles now use the full available width of the open sidebar. Previously, every item reserved space at the end for an optional secondary action, even when there was none, which caused long titles to be truncated earlier than necessary. Short titles look the same as before, while long titles that were previously truncated now show more characters or the complete title.
