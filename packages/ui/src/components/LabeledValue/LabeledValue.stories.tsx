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
import { LabeledValue } from './LabeledValue';
import { Badge } from '../Badge';
import { Flex } from '../Flex';
import { Link } from '../Link';

const meta = preview.meta({
  title: 'Backstage UI/LabeledValue',
  component: LabeledValue,
  argTypes: {
    label: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
    variant: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    grow: {
      control: 'boolean',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
    },
  },
  args: {
    label: 'Owner',
    value: 'team-a',
  },
});

export const Default = meta.story({
  args: {},
});

export const Vertical = meta.story({
  args: {
    variant: 'vertical',
  },
});

export const WithNumber = meta.story({
  args: {
    label: 'Stars',
    value: 1234567.89,
  },
});

export const WithDate = meta.story({
  args: {
    label: 'Created',
    value: new Date('2026-10-17T09:30:00Z'),
  },
});

export const WithChildren = meta.story({
  args: {
    label: 'Status',
    value: undefined,
  },
  render: args => (
    <LabeledValue {...args}>
      <Badge>Running</Badge>
    </LabeledValue>
  ),
});

export const GrowAndAlign = meta.story({
  args: {
    grow: true,
  },
  render: args => (
    <Flex direction="column" gap="2" style={{ width: 320 }}>
      <LabeledValue {...args} label="Start" value="Aligned start" />
      <LabeledValue
        {...args}
        label="Center"
        value="Aligned center"
        align="center"
      />
      <LabeledValue {...args} label="End" value="Aligned end" align="end" />
      <LabeledValue {...args} label="Stars" value={1234567} align="end" />
      <LabeledValue
        {...args}
        label="Created"
        value={new Date('2026-10-17T09:30:00Z')}
        align="end"
      />
    </Flex>
  ),
});

export const Responsive = meta.story({
  args: {
    variant: { initial: 'vertical', md: 'horizontal' },
  },
  render: args => (
    <Flex direction="column" gap="2">
      <LabeledValue {...args} label="Owner" value="team-a" />
      <LabeledValue {...args} label="Lifecycle" value="production" />
      <LabeledValue {...args} label="Type" value="service" />
    </Flex>
  ),
});

export const Group = meta.story({
  render: () => (
    <Flex direction="column" gap="2" style={{ width: 320 }}>
      <LabeledValue label="Owner" grow>
        <Link href="#">team-a</Link>
      </LabeledValue>
      <LabeledValue label="Lifecycle" value="production" grow />
      <LabeledValue label="Stars" value={1234567} grow align="end" />
      <LabeledValue
        label="Created"
        value={new Date('2026-10-17T09:30:00Z')}
        grow
        align="end"
      />
      <LabeledValue label="Status" grow align="end">
        <Badge>Running</Badge>
      </LabeledValue>
    </Flex>
  ),
});
