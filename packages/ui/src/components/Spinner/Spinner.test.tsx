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
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders an indeterminate progress bar with a default label and size', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('progressbar', { name: 'Loading' });
    expect(spinner).toHaveClass('bui-Spinner');
    expect(spinner).toHaveAttribute('data-size', 'medium');
    expect(spinner).not.toHaveAttribute('aria-valuenow');
    expect(spinner.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports custom labels, sizes, className, style and data attributes', () => {
    const { rerender } = render(
      <Spinner
        size="large"
        label="Loading entities"
        className="custom"
        style={{ margin: 4 }}
        data-testid="my-spinner"
      />,
    );

    const spinner = screen.getByRole('progressbar', {
      name: 'Loading entities',
    });
    expect(spinner).toHaveAttribute('data-size', 'large');
    expect(spinner).toHaveClass('bui-Spinner', 'custom');
    expect(spinner).toHaveStyle({ margin: '4px' });
    expect(spinner).toHaveAttribute('data-testid', 'my-spinner');

    rerender(<Spinner aria-label="Saving" />);
    expect(screen.getByRole('progressbar', { name: 'Saving' })).toBeTruthy();

    rerender(
      <>
        <span id="status-text">Refreshing</span>
        <Spinner aria-labelledby="status-text" />
      </>,
    );
    expect(
      screen.getByRole('progressbar', { name: 'Refreshing' }),
    ).toBeTruthy();
  });
});
