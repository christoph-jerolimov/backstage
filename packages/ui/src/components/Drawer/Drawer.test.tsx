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

import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Button } from '../Button';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from './Drawer';

const drawerContent = (
  <>
    <DrawerHeader>Example Drawer</DrawerHeader>
    <DrawerBody>Drawer content</DrawerBody>
    <DrawerFooter>
      <Button slot="close">Cancel</Button>
    </DrawerFooter>
  </>
);

const overlay = () => document.querySelector('.bui-DrawerOverlay');
const container = () => document.querySelector('.bui-Drawer');

describe('Drawer', () => {
  it('opens from a trigger as a modal drawer and closes through its controls', async () => {
    render(
      <DrawerTrigger>
        <Button>Open</Button>
        <Drawer>{drawerContent}</Drawer>
      </DrawerTrigger>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    const dialog = await screen.findByRole('dialog', {
      name: 'Example Drawer',
    });
    expect(dialog).toHaveTextContent('Drawer content');
    expect(overlay()).toHaveAttribute('data-position', 'right');
    expect(overlay()).toHaveAttribute('data-isnonmodal', 'false');
    expect(document.querySelector('.bui-DrawerBackdrop')).toBeInTheDocument();
    expect(container()).toHaveStyle({ '--bui-drawer-width': '400px' });

    // The modal drawer hides the rest of the page from assistive technology.
    expect(
      screen
        .getByRole('button', { name: 'Open', hidden: true })
        .closest('[aria-hidden="true"]'),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('applies placement, width, backdrop and dismiss options', async () => {
    const { rerender } = render(
      <Drawer defaultOpen placement="left" width="50%" hideBackdrop>
        {drawerContent}
      </Drawer>,
    );

    const dialog = await screen.findByRole('dialog');
    expect(overlay()).toHaveAttribute('data-position', 'left');
    expect(
      document.querySelector('.bui-DrawerBackdrop'),
    ).not.toBeInTheDocument();
    expect(container()).toHaveStyle({ '--bui-drawer-width': '50%' });

    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.keyUp(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Drawer isOpen placement="end" isDismissable={false}>
        {drawerContent}
      </Drawer>,
    );
    const persistent = await screen.findByRole('dialog');
    expect(overlay()).toHaveAttribute('data-position', 'right');
    fireEvent.keyDown(persistent, { key: 'Escape' });
    fireEvent.keyUp(persistent, { key: 'Escape' });
    expect(persistent).toBeInTheDocument();
  });

  it('supports top and bottom placements sized by height', async () => {
    const { rerender } = render(
      <Drawer isOpen placement="bottom" height={320}>
        {drawerContent}
      </Drawer>,
    );

    await screen.findByRole('dialog');
    expect(overlay()).toHaveAttribute('data-position', 'bottom');
    expect(container()).toHaveStyle({ '--bui-drawer-height': '320px' });

    rerender(
      <Drawer isOpen placement="top" height="40vh">
        {drawerContent}
      </Drawer>,
    );
    expect(overlay()).toHaveAttribute('data-position', 'top');
    expect(container()).toHaveStyle({ '--bui-drawer-height': '40vh' });
  });

  it('keeps the page interactive when non-modal and respects isDismissable', async () => {
    const Controlled = () => {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open</Button>
          <input aria-label="Page input" />
          <Drawer isOpen={isOpen} onOpenChange={setIsOpen} isNonModal>
            {drawerContent}
          </Drawer>
        </>
      );
    };

    render(<Controlled />);

    const dialog = await screen.findByRole('dialog', {
      name: 'Example Drawer',
    });
    expect(overlay()).toHaveAttribute('data-isnonmodal', 'true');
    expect(overlay()).toHaveAttribute('data-position', 'right');
    expect(
      document.querySelector('.bui-DrawerBackdrop'),
    ).not.toBeInTheDocument();

    // Page content is neither hidden from assistive technology nor blocked.
    const pageInput = screen.getByLabelText('Page input');
    expect(pageInput.closest('[aria-hidden="true"]')).toBeNull();
    pageInput.focus();
    expect(pageInput).toHaveFocus();
    expect(dialog).toBeInTheDocument();

    // Interacting outside closes a dismissable non-modal drawer.
    fireEvent.pointerDown(pageInput);
    fireEvent.click(pageInput);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Reopen and close through the close button.
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('only closes a non-dismissable non-modal drawer through its own controls', async () => {
    render(
      <>
        <input aria-label="Page input" />
        <Drawer defaultOpen isNonModal isDismissable={false}>
          {drawerContent}
        </Drawer>
      </>,
    );

    const dialog = await screen.findByRole('dialog');
    const pageInput = screen.getByLabelText('Page input');
    fireEvent.pointerDown(pageInput);
    fireEvent.click(pageInput);
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.keyUp(dialog, { key: 'Escape' });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
