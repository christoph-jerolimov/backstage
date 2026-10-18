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
import { useState } from 'react';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import preview from '../../../../../.storybook/preview';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from './Collapsible';
import { Box } from '../Box';
import { Button } from '../Button';
import { ButtonIcon } from '../ButtonIcon';
import { Flex } from '../Flex';
import { Text } from '../Text';

const Content = () => (
  <Box pt="2">
    <Text as="p">
      It's the edge of the world and all of Western civilization
    </Text>
    <Text as="p">
      The sun may rise in the East, at least it settled in a final location
    </Text>
    <Text as="p">It's understood that Hollywood sells Californication</Text>
  </Box>
);

const meta = preview.meta({
  title: 'Backstage UI/Collapsible',
  component: Collapsible,
});

export const Default = meta.story({
  render: () => (
    <Collapsible>
      <CollapsibleTrigger>Show details</CollapsibleTrigger>
      <CollapsiblePanel>
        <Content />
      </CollapsiblePanel>
    </Collapsible>
  ),
});

export const DefaultExpanded = meta.story({
  render: () => (
    <Collapsible defaultExpanded>
      <CollapsibleTrigger>Show details</CollapsibleTrigger>
      <CollapsiblePanel>
        <Content />
      </CollapsiblePanel>
    </Collapsible>
  ),
});

export const Disabled = meta.story({
  render: () => (
    <Collapsible isDisabled>
      <CollapsibleTrigger>Show details</CollapsibleTrigger>
      <CollapsiblePanel>
        <Content />
      </CollapsiblePanel>
    </Collapsible>
  ),
});

export const WithIcon = meta.story({
  render: () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <Collapsible isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
        <CollapsibleTrigger>
          {isExpanded ? (
            <RiArrowDownSLine size={16} aria-hidden="true" />
          ) : (
            <RiArrowRightSLine size={16} aria-hidden="true" />
          )}
          {isExpanded ? 'Hide details' : 'Show details'}
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <Content />
        </CollapsiblePanel>
      </Collapsible>
    );
  },
});

export const WithButtonTrigger = meta.story({
  render: () => (
    <Collapsible>
      <Button slot="trigger" variant="secondary">
        Advanced options
      </Button>
      <CollapsiblePanel>
        <Content />
      </CollapsiblePanel>
    </Collapsible>
  ),
});

export const WithButtonIconTrigger = meta.story({
  render: () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <Collapsible isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
        <Flex align="center" gap="2">
          <ButtonIcon
            slot="trigger"
            size="small"
            variant="tertiary"
            aria-label={isExpanded ? 'Hide details' : 'Show details'}
            icon={isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
          />
          <Text weight="bold">Deployment details</Text>
        </Flex>
        <CollapsiblePanel>
          <Content />
        </CollapsiblePanel>
      </Collapsible>
    );
  },
});

export const Controlled = meta.story({
  render: () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <Flex direction="column" gap="4" align="start">
        <Flex gap="2">
          <Button variant="secondary" onPress={() => setIsExpanded(true)}>
            Expand
          </Button>
          <Button variant="secondary" onPress={() => setIsExpanded(false)}>
            Collapse
          </Button>
        </Flex>
        <Collapsible isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
          <CollapsibleTrigger>
            {isExpanded ? 'Hide details' : 'Show details'}
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <Content />
          </CollapsiblePanel>
        </Collapsible>
      </Flex>
    );
  },
});
