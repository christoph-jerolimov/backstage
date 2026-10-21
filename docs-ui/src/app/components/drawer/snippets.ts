export const drawerUsageSnippet = `import { 
  Drawer, 
  DrawerTrigger, 
  DrawerHeader, 
  DrawerBody, 
  DrawerFooter, 
} from '@backstage/ui';

<DrawerTrigger>
  <Button>Open Drawer</Button>
  <Drawer>
    <DrawerHeader>Title</DrawerHeader>
    <DrawerBody>Content</DrawerBody>
    <DrawerFooter>
      <Button variant="secondary" slot="close">Close</Button>
    </DrawerFooter>
  </Drawer>
</DrawerTrigger>`;

export const drawerDefaultSnippet = `<DrawerTrigger>
  <Button variant="secondary">Open Drawer</Button>
  <Drawer>
    <DrawerHeader>Example Drawer</DrawerHeader>
    <DrawerBody>
      <Text>This is a basic drawer example.</Text>
    </DrawerBody>
    <DrawerFooter>
      <Button variant="secondary" slot="close">Close</Button>
      <Button variant="primary" slot="close">Save</Button>
    </DrawerFooter>
  </Drawer>
</DrawerTrigger>`;

export const drawerPlacementSnippet = `<DrawerTrigger>
  <Button variant="secondary">Open from the left</Button>
  <Drawer placement="left" width={320}>
    <DrawerHeader>Navigation</DrawerHeader>
    <DrawerBody>
      ...
    </DrawerBody>
  </Drawer>
</DrawerTrigger>`;

export const drawerBottomSnippet = `<DrawerTrigger>
  <Button variant="secondary">Open from the bottom</Button>
  <Drawer placement="bottom" height={320}>
    <DrawerHeader>Bottom sheet</DrawerHeader>
    <DrawerBody>
      ...
    </DrawerBody>
  </Drawer>
</DrawerTrigger>`;

export const drawerHiddenBackdropSnippet = `<DrawerTrigger>
  <Button variant="secondary">Open Drawer</Button>
  <Drawer hideBackdrop>
    <DrawerHeader>Example Drawer</DrawerHeader>
    <DrawerBody>
      ...
    </DrawerBody>
  </Drawer>
</DrawerTrigger>`;

export const drawerNonModalSnippet = `<DrawerTrigger>
  <Button variant="secondary">Open Drawer</Button>
  <Drawer isNonModal isDismissable={false}>
    <DrawerHeader>Details</DrawerHeader>
    <DrawerBody>
      ...
    </DrawerBody>
    <DrawerFooter>
      <Button variant="secondary" slot="close">Close</Button>
    </DrawerFooter>
  </Drawer>
</DrawerTrigger>`;

export const drawerWithNoTriggerSnippet = `const [isOpen, setIsOpen] = useState(false);

<Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
  <DrawerHeader>Create New User</DrawerHeader>
  <DrawerBody>
    Your content
  </DrawerBody>
  <DrawerFooter>
    <Button variant="secondary" slot="close">Cancel</Button>
    <Button variant="primary" slot="close">Create User</Button>
  </DrawerFooter>
</Drawer>`;

export const drawerCloseSnippet = `<Button slot="close">Close</Button>`;
