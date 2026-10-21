/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import preview from '../../../../../.storybook/preview';
import { Separator } from './Separator';
import { Box } from '../Box';
import { Button } from '../Button';
import { Flex } from '../Flex';
import { Text } from '../Text';

const meta = preview.meta({
  title: 'Backstage UI/Separator',
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          'A thin line that visually and semantically separates content. Use it horizontally between stacked sections or vertically between items placed side by side.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    orientation: 'horizontal',
  },
});

export const Default = meta.story({
  render: args => (
    <Flex direction="column" gap="4">
      <Text>Content above the separator</Text>
      <Separator {...args} />
      <Text>Content below the separator</Text>
    </Flex>
  ),
});

export const Horizontal = meta.story({
  render: () => (
    <Box style={{ maxWidth: '24rem' }}>
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
    </Box>
  ),
});

export const Vertical = meta.story({
  render: () => (
    <Flex align="center" gap="3">
      <Text>Overview</Text>
      <Separator orientation="vertical" />
      <Text>Docs</Text>
      <Separator orientation="vertical" />
      <Text>Dependencies</Text>
    </Flex>
  ),
});

export const VerticalBetweenActions = meta.story({
  render: () => (
    <Flex align="center" gap="2">
      <Button variant="tertiary">Edit</Button>
      <Button variant="tertiary">Duplicate</Button>
      <Separator orientation="vertical" my="1" />
      <Button variant="tertiary">Delete</Button>
    </Flex>
  ),
});

export const WithMargin = meta.story({
  render: () => (
    <Flex direction="column" style={{ maxWidth: '24rem' }}>
      <Text>Default spacing is controlled by the surrounding layout.</Text>
      <Separator />
      <Text>Margin utility props add space around the separator.</Text>
      <Separator my="6" />
      <Text>This paragraph follows a separator with a larger margin.</Text>
    </Flex>
  ),
});
