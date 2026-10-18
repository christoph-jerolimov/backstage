'use client';

import {
  Drawer,
  DrawerTrigger,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from '../../../../../packages/ui/src/components/Drawer/Drawer';
import { Button } from '../../../../../packages/ui/src/components/Button/Button';
import { Flex } from '../../../../../packages/ui/src/components/Flex/Flex';
import { Text } from '../../../../../packages/ui/src/components/Text/Text';
import { TextField } from '../../../../../packages/ui/src/components/TextField/TextField';

export const Default = () => (
  <DrawerTrigger>
    <Button variant="secondary">Open Drawer</Button>
    <Drawer>
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

export const PreviewPlacement = () => (
  <DrawerTrigger>
    <Button variant="secondary">Open from the left</Button>
    <Drawer placement="left" width={320}>
      <DrawerHeader>Navigation</DrawerHeader>
      <DrawerBody>
        <Flex direction="column" gap="3">
          <Text>Drawers can slide in from the left or the right edge.</Text>
          <Text>Use the width prop to size them.</Text>
        </Flex>
      </DrawerBody>
    </Drawer>
  </DrawerTrigger>
);

export const PreviewBottom = () => (
  <DrawerTrigger>
    <Button variant="secondary">Open from the bottom</Button>
    <Drawer placement="bottom" height={320}>
      <DrawerHeader>Bottom sheet</DrawerHeader>
      <DrawerBody>
        <Text>
          Top and bottom drawers span the full width of the viewport and are
          sized with the height prop.
        </Text>
      </DrawerBody>
    </Drawer>
  </DrawerTrigger>
);

export const PreviewHiddenBackdrop = () => (
  <DrawerTrigger>
    <Button variant="secondary">Open Drawer</Button>
    <Drawer hideBackdrop>
      <DrawerHeader>Example Drawer</DrawerHeader>
      <DrawerBody>
        <Text>
          This drawer is still modal, but it does not dim the page behind it.
        </Text>
      </DrawerBody>
      <DrawerFooter>
        <Button variant="secondary" slot="close">
          Close
        </Button>
      </DrawerFooter>
    </Drawer>
  </DrawerTrigger>
);

export const PreviewNonModal = () => (
  <Flex direction="column" gap="3" align="start">
    <TextField label="Page content" placeholder="Still reachable" />
    <DrawerTrigger>
      <Button variant="secondary">Open Drawer</Button>
      <Drawer isNonModal isDismissable={false}>
        <DrawerHeader>Details</DrawerHeader>
        <DrawerBody>
          <Text>
            The page behind this drawer stays interactive. Try the text field
            while the drawer is open.
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
);
