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

import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Separator } from './Separator';

describe('Separator', () => {
  it('renders a horizontal hr by default with margin utility props and custom attributes', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Separator
        ref={ref}
        my="4"
        className="custom"
        style={{ opacity: 0.5 }}
        id="divider"
      />,
    );

    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('HR');
    expect(separator).toBe(ref.current);
    expect(separator).toHaveAttribute('id', 'divider');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).not.toHaveAttribute('aria-orientation');
    expect(separator).toHaveClass('bui-Separator', 'custom', 'bui-my-4');
    expect(separator).toHaveStyle({ opacity: 0.5 });
  });

  it('renders a vertical separator with the separator role and orientation', () => {
    render(<Separator orientation="vertical" />);

    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('DIV');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });
});
