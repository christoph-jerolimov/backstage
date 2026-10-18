---
'@backstage/ui': patch
---

Added a `Separator` component that draws a thin line between content. Use it horizontally between stacked sections, or vertically between items placed side by side. It accepts margin utility props for spacing and is announced as a separator by assistive technologies.

```tsx
import { Flex, Separator, Text } from '@backstage/ui';

<Flex direction="column">
  <Text>Overview</Text>
  <Separator my="4" />
  <Text>Details</Text>
</Flex>;
```

**Affected components:** Separator
