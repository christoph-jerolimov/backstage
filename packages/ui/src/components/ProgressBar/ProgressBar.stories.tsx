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
import { ProgressBar } from './ProgressBar';
import { Box } from '../Box';
import { Card, CardBody, CardHeader } from '../Card';
import { Flex } from '../Flex';
import { Text } from '../Text';

const meta = preview.meta({
  title: 'Backstage UI/ProgressBar',
  component: ProgressBar,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    isIndeterminate: {
      control: 'boolean',
    },
    showValueLabel: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
  },
  args: {
    value: 40,
    size: 'medium',
    color: 'primary',
    isIndeterminate: false,
    showValueLabel: false,
  },
  decorators: [
    Story => (
      <Box style={{ width: 320 }}>
        <Story />
      </Box>
    ),
  ],
});

export const Default = meta.story({
  args: {},
});

export const Indeterminate = meta.story({
  args: {
    isIndeterminate: true,
    'aria-label': 'Loading entities',
  },
});

export const WithLabel = meta.story({
  args: {
    label: 'Uploading',
  },
});

export const WithValueLabel = meta.story({
  args: {
    label: 'Uploading',
    showValueLabel: true,
  },
});

export const CustomRange = meta.story({
  args: {
    label: 'Steps completed',
    showValueLabel: true,
    value: 3,
    minValue: 0,
    maxValue: 10,
    valueLabel: '3 of 10',
  },
});

export const Sizes = meta.story({
  render: () => (
    <Flex direction="column" gap="4">
      <ProgressBar label="Small" size="small" value={40} />
      <ProgressBar label="Medium" size="medium" value={40} />
      <ProgressBar label="Large" size="large" value={40} />
    </Flex>
  ),
});

export const Colors = meta.story({
  render: () => (
    <Flex direction="column" gap="4">
      <ProgressBar label="Primary" color="primary" value={60} />
      <ProgressBar label="Success" color="success" value={100} />
      <ProgressBar label="Warning" color="warning" value={75} />
      <ProgressBar label="Danger" color="danger" value={30} />
    </Flex>
  ),
});

export const InCard = meta.story({
  render: () => (
    <Card>
      <CardHeader>
        <Text variant="title-x-small" weight="bold">
          Build in progress
        </Text>
      </CardHeader>
      <CardBody>
        <Flex direction="column" gap="3">
          <Text color="secondary">Compiling 128 of 320 packages</Text>
          <ProgressBar
            aria-label="Build progress"
            value={128}
            maxValue={320}
            showValueLabel
          />
        </Flex>
      </CardBody>
    </Card>
  ),
});

export const BackgroundAwareness = meta.story({
  render: () => (
    <Box bg="neutral" p="4">
      <Text>Neutral 1 container</Text>
      <Box mt="2" pb="4">
        <ProgressBar value={40} />
      </Box>
      <Box bg="neutral" p="4">
        <Text>Neutral 2 container</Text>
        <Box mt="2" pb="4">
          <ProgressBar value={40} />
        </Box>
        <Box bg="neutral" p="4">
          <Text>Neutral 3 container</Text>
          <Box mt="2">
            <ProgressBar value={40} />
          </Box>
        </Box>
      </Box>
    </Box>
  ),
});
