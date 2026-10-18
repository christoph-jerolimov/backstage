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
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from './Collapsible';

describe('Collapsible', () => {
  it('toggles its panel from the trigger and exposes the expanded state', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Show details</CollapsibleTrigger>
        <CollapsiblePanel>Panel content</CollapsiblePanel>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', { name: 'Show details' });
    const panel = screen.getByText('Panel content');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(panel).not.toBeVisible();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toBeVisible();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toBeVisible();
  });

  it('supports defaultExpanded and isDisabled', () => {
    render(
      <Collapsible defaultExpanded isDisabled>
        <CollapsibleTrigger>Show details</CollapsibleTrigger>
        <CollapsiblePanel>Panel content</CollapsiblePanel>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', { name: 'Show details' });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toBeDisabled();
    expect(screen.getByText('Panel content')).toBeVisible();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('can be controlled and accepts a Button with slot="trigger"', () => {
    const onExpandedChange = jest.fn();

    function Controlled() {
      const [isExpanded, setIsExpanded] = useState(false);
      return (
        <Collapsible
          isExpanded={isExpanded}
          onExpandedChange={value => {
            onExpandedChange(value);
            setIsExpanded(value);
          }}
        >
          <Button slot="trigger">Advanced options</Button>
          <CollapsiblePanel>Panel content</CollapsiblePanel>
        </Collapsible>
      );
    }

    render(<Controlled />);

    const trigger = screen.getByRole('button', { name: 'Advanced options' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Panel content')).not.toBeVisible();

    fireEvent.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Panel content')).toBeVisible();
  });
});
