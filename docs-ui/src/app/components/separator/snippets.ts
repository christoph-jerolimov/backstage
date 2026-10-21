export const separatorUsageSnippet = `import { Separator } from '@backstage/ui';

<Separator />`;

export const defaultSnippet = `<Box bg="neutral" p="4" style={{ width: 320 }}>
  <Text as="h3" variant="title-x-small">
    Backstage UI
  </Text>
  <Text as="p" color="secondary">
    A component library for building developer portals.
  </Text>
  <Separator my="4" />
  <Text as="p">
    Components, layout primitives, and design tokens for Backstage apps and
    plugins.
  </Text>
</Box>`;

export const verticalSnippet = `<Flex align="center" gap="3">
  <Text>Overview</Text>
  <Separator orientation="vertical" />
  <Text>Docs</Text>
  <Separator orientation="vertical" />
  <Text>Dependencies</Text>
</Flex>`;

export const betweenActionsSnippet = `<Flex align="center" gap="2">
  <Button variant="tertiary">Edit</Button>
  <Button variant="tertiary">Duplicate</Button>
  <Separator orientation="vertical" my="1" />
  <Button variant="tertiary">Delete</Button>
</Flex>`;

export const spacingSnippet = `<Flex direction="column">
  <Text>Spacing comes from the surrounding layout by default.</Text>
  <Separator />
  <Text>Margin props add space around the separator.</Text>
  <Separator my="6" />
  <Text>This paragraph follows a separator with a larger margin.</Text>
</Flex>`;
