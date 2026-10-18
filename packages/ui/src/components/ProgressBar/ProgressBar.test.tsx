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
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders a determinate progress bar with value, label and formatted value text', () => {
    render(<ProgressBar label="Uploading" value={40} showValueLabel />);

    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar).toHaveClass('bui-ProgressBar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuetext', '40%');
    expect(bar).toHaveAttribute('data-size', 'medium');
    expect(bar).toHaveAttribute('data-color', 'primary');
    expect(screen.getByText('40%')).toHaveClass('bui-ProgressBarValue');
    expect(bar.querySelector('.bui-ProgressBarFill')).toHaveStyle({
      width: '40%',
    });
  });

  it('supports custom ranges, value labels, sizes, colors and pass-through props', () => {
    render(
      <ProgressBar
        label="Steps"
        value={3}
        minValue={0}
        maxValue={10}
        valueLabel="3 of 10"
        showValueLabel
        size="large"
        color="success"
        className="custom"
        style={{ margin: 4 }}
        data-testid="steps"
      />,
    );

    const bar = screen.getByRole('progressbar', { name: 'Steps' });
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 10');
    expect(screen.getByText('3 of 10')).toBeInTheDocument();
    expect(bar).toHaveAttribute('data-size', 'large');
    expect(bar).toHaveAttribute('data-color', 'success');
    expect(bar).toHaveClass('bui-ProgressBar', 'custom');
    expect(bar).toHaveStyle({ margin: '4px' });
    expect(bar).toHaveAttribute('data-testid', 'steps');
    expect(bar.querySelector('.bui-ProgressBarFill')).toHaveStyle({
      width: '30%',
    });
  });

  it('renders an indeterminate bar with a default accessible name and no value', () => {
    const { rerender } = render(<ProgressBar isIndeterminate showValueLabel />);

    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar.querySelector('.bui-ProgressBarValue')).toBeNull();
    expect(bar.querySelector('.bui-ProgressBarFill')).toHaveAttribute(
      'data-indeterminate',
      'true',
    );

    rerender(<ProgressBar isIndeterminate aria-label="Syncing" />);
    expect(
      screen.getByRole('progressbar', { name: 'Syncing' }),
    ).toBeInTheDocument();
  });
});
