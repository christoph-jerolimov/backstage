---
'@backstage/core-components': patch
---

The `Progress` component now renders the Backstage UI `ProgressBar` instead of the Material UI linear progress bar. The `variant`, `value`, `className`, `style`, `id`, and `aria-*` props keep working, while Material UI specific props such as `classes`, `color`, and `valueBuffer` no longer have an effect.
