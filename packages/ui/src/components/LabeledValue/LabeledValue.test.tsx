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

import { act, render, screen } from '@testing-library/react';
import { BUIProvider } from '../../provider';
import { LabeledValue } from './LabeledValue';

function renderLabeledValue(ui: React.ReactElement) {
  return render(<BUIProvider>{ui}</BUIProvider>);
}

describe('LabeledValue', () => {
  it('renders label, string values and children in the requested layout', () => {
    const { rerender } = renderLabeledValue(
      <LabeledValue label="Owner" value="team-a" data-testid="root" />,
    );

    const root = screen.getByTestId('root');
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('team-a')).toBeInTheDocument();
    expect(root).toHaveAttribute('data-variant', 'horizontal');
    expect(root).toHaveAttribute('data-align', 'start');
    expect(root).not.toHaveAttribute('data-grow');

    rerender(
      <BUIProvider>
        <LabeledValue
          label="Status"
          variant="vertical"
          grow
          align="end"
          className="custom"
          data-testid="root"
        >
          <span>Running</span>
        </LabeledValue>
      </BUIProvider>,
    );

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByTestId('root')).toHaveAttribute(
      'data-variant',
      'vertical',
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-grow', 'true');
    expect(screen.getByTestId('root')).toHaveAttribute('data-align', 'end');
    expect(screen.getByTestId('root')).toHaveClass(
      'bui-LabeledValue',
      'custom',
    );

    rerender(
      <BUIProvider>
        <LabeledValue label="Owner" value="team-a">
          <span>ignored</span>
        </LabeledValue>
      </BUIProvider>,
    );

    expect(screen.getByText('team-a')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('formats numbers with the browser locale and shows the raw value in a tooltip', async () => {
    const value = 1234567.891;
    renderLabeledValue(<LabeledValue label="Stars" value={value} />);

    const formatted = screen.getByText(value.toLocaleString());
    expect(formatted).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await act(async () => {
      formatted.focus();
    });

    expect(
      await screen.findByRole('tooltip', { name: '1234567.891' }),
    ).toBeInTheDocument();
  });

  it('formats dates with the browser locale and shows the ISO value in a tooltip', async () => {
    const value = new Date('2026-10-17T09:30:00.000Z');
    renderLabeledValue(<LabeledValue label="Created" value={value} />);

    const formatted = screen.getByText(value.toLocaleString());
    await act(async () => {
      formatted.focus();
    });

    expect(
      await screen.findByRole('tooltip', { name: '2026-10-17T09:30:00.000Z' }),
    ).toBeInTheDocument();
  });

  it('omits the tooltip when the formatted value matches the input', async () => {
    renderLabeledValue(<LabeledValue label="Count" value={42} />);

    const formatted = screen.getByText('42');
    expect(formatted).not.toHaveAttribute('tabindex');

    await act(async () => {
      formatted.focus();
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
