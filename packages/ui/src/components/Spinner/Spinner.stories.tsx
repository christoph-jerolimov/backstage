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
import { Spinner } from './Spinner';
import { Box } from '../Box';
import { Button } from '../Button';
import { Card, CardBody, CardHeader } from '../Card';
import { Flex } from '../Flex';
import { Text } from '../Text';

const meta = preview.meta({
  title: 'Backstage UI/Spinner',
  component: Spinner,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    label: {
      control: 'text',
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    showValueLabel: {
      control: 'boolean',
    },
  },
  args: {
    size: 'medium',
    label: 'Loading',
    showValueLabel: false,
  },
});

export const Default = meta.story({
  args: {},
});

export const Sizes = meta.story({
  render: () => (
    <Flex gap="4" align="center">
      <Spinner size="small" />
      <Spinner size="medium" />
      <Spinner size="large" />
    </Flex>
  ),
});

export const Determinate = meta.story({
  args: {
    label: 'Uploading',
    value: 40,
  },
});

export const DeterminateWithValueLabel = meta.story({
  args: {
    label: 'Uploading',
    value: 40,
    showValueLabel: true,
  },
});

export const DeterminateSizes = meta.story({
  render: () => (
    <Flex gap="4" align="center">
      <Spinner size="small" value={25} />
      <Spinner size="medium" value={50} />
      <Spinner size="large" value={75} />
    </Flex>
  ),
});

export const CustomRange = meta.story({
  args: {
    label: 'Steps completed',
    value: 3,
    minValue: 0,
    maxValue: 10,
    valueLabel: '3 of 10',
    showValueLabel: true,
  },
});

export const WithText = meta.story({
  render: () => (
    <Flex gap="2" align="center">
      <Spinner size="small" />
      <Text>Loading entities…</Text>
    </Flex>
  ),
});

export const InheritsColor = meta.story({
  render: () => (
    <Flex gap="4" align="center">
      <Text color="secondary">
        <Spinner />
      </Text>
      <Text color="danger">
        <Spinner />
      </Text>
      <Box style={{ color: 'var(--bui-fg-positive)' }}>
        <Spinner />
      </Box>
    </Flex>
  ),
});

export const InCard = meta.story({
  render: () => (
    <Card style={{ width: 320 }}>
      <CardHeader>
        <Text variant="title-x-small" weight="bold">
          Deployments
        </Text>
      </CardHeader>
      <CardBody>
        <Flex justify="center" align="center" style={{ height: 120 }}>
          <Spinner size="large" label="Loading deployments" />
        </Flex>
      </CardBody>
    </Card>
  ),
});

export const CenteredInPage = meta.story({
  render: () => (
    <Flex
      justify="center"
      align="center"
      direction="column"
      gap="3"
      style={{ height: 320 }}
    >
      <Spinner size="large" />
      <Text color="secondary">Fetching the latest data</Text>
    </Flex>
  ),
});

export const BesideButton = meta.story({
  render: () => (
    <Flex gap="4" align="center">
      <Button isPending>Save</Button>
      <Spinner size="small" />
    </Flex>
  ),
});
