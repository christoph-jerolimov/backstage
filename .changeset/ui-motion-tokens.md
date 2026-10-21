---
'@backstage/ui': patch
---

Added motion tokens: `--bui-duration-1` through `--bui-duration-4` and `--bui-ease-out` / `--bui-ease-in-out`. All component transitions and animations now use these tokens, so a theme can tune motion in one place. When the user enables reduced motion in their operating system, every duration token is set to `0ms`, so transitions and animations across all components complete instantly.
