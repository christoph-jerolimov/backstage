---
'@backstage/ui': patch
---

Added the `LabeledValue` component for displaying a value together with a label that describes it. The label and value can be placed side by side with the `horizontal` variant (default) or stacked with the `vertical` variant. Strings are rendered as they are, while numbers and dates are formatted with the browser locale and show their unformatted input value in a tooltip. Any other content can be passed as children to be rendered as the value. The optional `grow` and `align` props control how the value fills and aligns within the available space.

```tsx
<LabeledValue label="Owner" value="team-a" />
<LabeledValue label="Stars" value={1234567} />
<LabeledValue label="Created" value={new Date(createdAt)} variant="vertical" />
<LabeledValue label="Status">
  <Badge>Running</Badge>
</LabeledValue>
```

The `Header` component now renders its metadata items with `LabeledValue`. The metadata row is rendered as a plain `div` container instead of a `dl` list, and each item is a `LabeledValue` carrying the `bui-HeaderMetaItem` class.

**Affected components:** LabeledValue, Header
