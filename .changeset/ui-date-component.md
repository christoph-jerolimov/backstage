---
'@backstage/ui': patch
---

Added a new `Date` component that renders a `Date` object, a date string, or a timestamp in the user's locale. Dates close to the current time are shown relative to now, for example "3 hours ago" or "tomorrow", and keep updating while displayed. Pass `relative={false}` to always show the absolute date. Hovering or focusing the date shows a tooltip with the full date and time. Use `tooltip="input"` to show the raw input value instead, or `tooltip="none"` to disable the tooltip.

**Affected components:** Date
