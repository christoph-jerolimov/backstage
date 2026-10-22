---
'@backstage/plugin-search-react': patch
---

The `SearchBar` and `SearchResultPager` components are now built with Backstage UI instead of Material UI. `SearchBar` renders the Backstage UI search field and keeps supporting the `value`, `onChange`, `onSubmit`, `onClear`, `debounceTime`, `clearButton`, `label`, `placeholder`, `className`, `autoFocus`, and `disabled` props, as well as the forwarded ref and `inputProps.ref` for accessing the input element. Material UI specific props, such as `InputProps`, `variant`, or `endAdornment`, are no longer applied by `SearchBar`; use `SearchBarBase` if you need a Material UI based search box. `SearchResultPager` renders Backstage UI buttons for the previous and next page.
