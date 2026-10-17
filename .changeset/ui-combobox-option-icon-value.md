---
'@backstage/ui': patch
---

Added optional `icon` and `value` fields to `Combobox` options. The `icon` is shown before the option text in the dropdown and in the input while that option is selected, replacing the field icon. The `value` is shown right-aligned in the dropdown and can display a count. Both require an option `id`; the deprecated `value` identity of options without an `id` is unchanged.

**Affected components:** Combobox
