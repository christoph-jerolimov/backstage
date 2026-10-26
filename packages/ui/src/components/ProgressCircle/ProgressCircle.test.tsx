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
import { ProgressCircle } from './ProgressCircle';

describe('ProgressCircle', () => {
  it('renders an indeterminate progress bar with a default label and size', () => {
    render(<ProgressCircle />);

    const spinner = screen.getByRole('progressbar', { name: 'Loading' });
    expect(spinner).toHaveClass('bui-ProgressCircle');
    expect(spinner).toHaveAttribute('data-size', 'medium');
    expect(spinner).toHaveAttribute('data-indeterminate', 'true');
    expect(spinner).not.toHaveAttribute('aria-valuenow');
    expect(spinner.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports custom labels, sizes, className, style and data attributes', () => {
    const { rerender } = render(
      <ProgressCircle
        size="large"
        label="Loading entities"
        className="custom"
        style={{ margin: 4 }}
        data-testid="my-progress-circle"
      />,
    );

    const spinner = screen.getByRole('progressbar', {
      name: 'Loading entities',
    });
    expect(spinner).toHaveAttribute('data-size', 'large');
    expect(spinner).toHaveClass('bui-ProgressCircle', 'custom');
    expect(spinner).toHaveStyle({ margin: '4px' });
    expect(spinner).toHaveAttribute('data-testid', 'my-progress-circle');

    rerender(<ProgressCircle aria-label="Saving" />);
    expect(screen.getByRole('progressbar', { name: 'Saving' })).toBeTruthy();

    rerender(
      <>
        <span id="status-text">Refreshing</span>
        <ProgressCircle aria-labelledby="status-text" />
      </>,
    );
    expect(
      screen.getByRole('progressbar', { name: 'Refreshing' }),
    ).toBeTruthy();
  });

  it('renders a determinate ring when a value is given', () => {
    const { rerender } = render(
      <ProgressCircle label="Uploading" value={40} showValueLabel />,
    );

    const spinner = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(spinner).toHaveAttribute('data-indeterminate', 'false');
    expect(spinner).toHaveAttribute('aria-valuenow', '40');
    expect(spinner).toHaveAttribute('aria-valuemin', '0');
    expect(spinner).toHaveAttribute('aria-valuemax', '100');
    expect(spinner).toHaveAttribute('aria-valuetext', '40%');
    expect(screen.getByText('40%')).toHaveClass('bui-ProgressCircleValue');
    const arc = spinner.querySelector('.bui-ProgressCircleArc');
    expect(arc).toHaveAttribute('stroke-dashoffset');
    const circumference = 2 * Math.PI * 10;
    expect(Number(arc?.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      circumference * 0.6,
    );

    rerender(
      <ProgressCircle
        label="Steps"
        value={3}
        minValue={0}
        maxValue={10}
        valueLabel="3 of 10"
        showValueLabel
      />,
    );
    const steps = screen.getByRole('progressbar', { name: 'Steps' });
    expect(steps).toHaveAttribute('aria-valuemax', '10');
    expect(steps).toHaveAttribute('aria-valuetext', '3 of 10');
    expect(screen.getByText('3 of 10')).toBeInTheDocument();

    rerender(<ProgressCircle value={40} isIndeterminate showValueLabel />);
    const forced = screen.getByRole('progressbar', { name: 'Loading' });
    expect(forced).toHaveAttribute('data-indeterminate', 'true');
    expect(forced).not.toHaveAttribute('aria-valuenow');
    expect(forced.querySelector('.bui-ProgressCircleValue')).toBeNull();
  });
});
