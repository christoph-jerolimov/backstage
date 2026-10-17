---
'@backstage/ui': patch
---

Added optional `icon` and `trailingValue` fields to `Select` and `Combobox` options. `icon` is shown before the option label in the dropdown, and `Select` also shows it in the trigger while that option is the only selected one. `trailingValue` is shown right-aligned after the label in the dropdown, for example to display a count. `SelectItemText` and `ComboboxItemText` also accept `trailingValue`.

**Affected components:** Combobox, Select
