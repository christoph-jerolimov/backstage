---
'@backstage/ui': patch
---

Added a `Collapsible` component for showing or hiding content behind a trigger. Unlike `Accordion`, it has no heading, background, or padding of its own, so it fits inline "Show more" patterns and custom triggers. It is made up of `Collapsible`, `CollapsibleTrigger`, and `CollapsiblePanel`, and any Backstage UI button can act as the trigger by passing `slot="trigger"`.

Affected components: Collapsible
