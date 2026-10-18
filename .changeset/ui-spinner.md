---
'@backstage/ui': patch
---

Added a new `Spinner` component, an indeterminate loading indicator for operations of unknown duration. It comes in `small`, `medium`, and `large` sizes, inherits its color from the surrounding text, is announced to assistive technologies with a configurable `label` (defaults to "Loading"), and respects the reduced motion preference.

Affected components: Spinner
