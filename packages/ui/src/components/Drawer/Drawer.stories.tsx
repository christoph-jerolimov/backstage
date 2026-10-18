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
import {
  Drawer,
  DrawerTrigger,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from './Drawer';
import { Button, Flex, Text, TextField, Select } from '@backstage/ui';
import { useArgs } from 'storybook/preview-api';

const meta = preview.meta({
  title: 'Backstage UI/Drawer',
  component: Drawer,
  args: {
    isOpen: undefined,
    defaultOpen: undefined,
    placement: 'right',
    isNonModal: false,
    hideBackdrop: false,
    isDismissable: true,
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    placement: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    width: { control: 'text' },
    height: { control: 'text' },
    isNonModal: { control: 'boolean' },
    hideBackdrop: { control: 'boolean' },
    isDismissable: { control: 'boolean' },
  },
});

const pageDecorator = (Story: React.ComponentType) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage:
        'radial-gradient(circle, var(--bui-border-1) 1px, transparent 1px)',
      backgroundSize: '16px 16px',
    }}
  >
    <Story />
  </div>
);

export const Default = meta.story({
  render: args => {
    return (
      <DrawerTrigger>
        <Button variant="secondary">Open Drawer</Button>
        <Drawer {...args}>
          <DrawerHeader>Example Drawer</DrawerHeader>
          <DrawerBody>
            <Text>This is a basic drawer example.</Text>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="secondary" slot="close">
              Close
            </Button>
            <Button variant="primary" slot="close">
              Save
            </Button>
          </DrawerFooter>
        </Drawer>
      </DrawerTrigger>
    );
  },
});

export const Open = Default.extend({
  parameters: { layout: 'fullscreen' },
  decorators: [pageDecorator],
  args: {
    defaultOpen: true,
  },
});

export const PlacementLeft = Open.extend({
  args: {
    placement: 'left',
  },
});

export const PlacementTop = Open.extend({
  args: {
    placement: 'top',
  },
});

export const PlacementBottom = Open.extend({
  args: {
    placement: 'bottom',
    height: 320,
  },
});

export const FixedWidth = Open.extend({
  args: {
    width: 640,
  },
});

export const HiddenBackdrop = Open.extend({
  args: {
    hideBackdrop: true,
  },
});

export const NonModal = meta.story({
  parameters: { layout: 'fullscreen' },
  decorators: [pageDecorator],
  args: {
    defaultOpen: true,
    isNonModal: true,
    isDismissable: false,
  },
  render: args => (
    <Flex direction="column" gap="3" align="center">
      <Text>
        The page behind a non-modal drawer stays interactive. Try the text field
        below while the drawer is open.
      </Text>
      <TextField label="Page content" placeholder="Still reachable" />
      <DrawerTrigger>
        <Button variant="secondary">Open Drawer</Button>
        <Drawer {...args}>
          <DrawerHeader>Non-modal Drawer</DrawerHeader>
          <DrawerBody>
            <Text>
              This drawer has no backdrop and does not trap focus. It only
              closes through its own close button or the Escape key.
            </Text>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="secondary" slot="close">
              Close
            </Button>
          </DrawerFooter>
        </Drawer>
      </DrawerTrigger>
    </Flex>
  ),
});

export const NonModalDismissable = NonModal.extend({
  args: {
    isDismissable: true,
  },
});

export const NoTrigger = meta.story({
  args: {
    isOpen: true,
  },
  render: args => {
    const [{ isOpen }, updateArgs] = useArgs();

    return (
      <Drawer
        {...args}
        isOpen={isOpen}
        onOpenChange={value => updateArgs({ isOpen: value })}
      >
        <DrawerHeader>Example Drawer</DrawerHeader>
        <DrawerBody>
          <Text>This is a basic drawer example.</Text>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary" slot="close">
            Close
          </Button>
          <Button variant="primary" slot="close">
            Save
          </Button>
        </DrawerFooter>
      </Drawer>
    );
  },
});

export const WithForm = meta.story({
  args: {
    isOpen: true,
  },
  render: args => (
    <DrawerTrigger {...args}>
      <Button variant="secondary">Create User</Button>
      <Drawer>
        <DrawerHeader>Create New User</DrawerHeader>
        <DrawerBody>
          <Flex direction="column" gap="3">
            <TextField label="Name" placeholder="Enter full name" />
            <TextField label="Email" placeholder="Enter email address" />
            <Select
              label="Role"
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
                { value: 'viewer', label: 'Viewer' },
              ]}
            />
          </Flex>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary" slot="close">
            Cancel
          </Button>
          <Button variant="primary" slot="close">
            Create User
          </Button>
        </DrawerFooter>
      </Drawer>
    </DrawerTrigger>
  ),
});

export const Overflow = meta.story({
  args: {
    defaultOpen: true,
  },
  render: args => (
    <DrawerTrigger>
      <Button variant="secondary">Open Drawer</Button>
      <Drawer {...args}>
        <DrawerHeader>Overflowing Content</DrawerHeader>
        <DrawerBody>
          <Flex direction="column" gap="3">
            {Array.from({ length: 40 }, (_, i) => (
              <Text key={i}>
                Line {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
              </Text>
            ))}
          </Flex>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary" slot="close">
            Cancel
          </Button>
          <Button variant="primary" slot="close">
            Confirm
          </Button>
        </DrawerFooter>
      </Drawer>
    </DrawerTrigger>
  ),
});

export const PreviewWithForm = WithForm.extend({
  args: {
    isOpen: undefined,
  },
});
