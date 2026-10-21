---
'@backstage/ui': patch
---

Added a new `ProgressCircle` component, a circular loading indicator. Without a `value` it rotates continuously for operations of unknown duration; with a `value` it renders a ring that fills up as work completes, with an optional formatted value label and custom value ranges. It comes in `small`, `medium`, and `large` sizes, inherits its color from the surrounding text, is announced to assistive technologies with a configurable `label` (defaults to "Loading"), and respects the reduced motion preference.

Affected components: ProgressCircle
