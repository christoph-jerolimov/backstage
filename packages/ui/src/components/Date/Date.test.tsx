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
import { I18nProvider } from 'react-aria-components';
import { Date as DateComponent } from './Date';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Noon local time keeps the calendar day arithmetic away from midnight.
const NOW = new Date(2026, 9, 17, 12, 0, 0);

const absolute = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', options).format(date);

describe('Date', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders close dates relative to now and far dates as absolute dates', () => {
    const threeHoursAgo = new Date(NOW.getTime() - 3 * HOUR);
    const tenDaysAgo = new Date(NOW.getTime() - 10 * DAY);

    const { rerender } = render(
      <>
        <DateComponent value={new Date(NOW.getTime() - 30 * 1000)} />
        <DateComponent value={new Date(NOW.getTime() - 5 * MINUTE)} />
        <DateComponent value={threeHoursAgo} />
        <DateComponent value={new Date(NOW.getTime() - DAY)} />
        <DateComponent value={new Date(NOW.getTime() + 3 * DAY)} />
        <DateComponent value={tenDaysAgo} />
      </>,
    );

    expect(screen.getByText('now')).toBeInTheDocument();
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
    expect(screen.getByText('yesterday')).toBeInTheDocument();
    expect(screen.getByText('in 3 days')).toBeInTheDocument();
    expect(
      screen.getByText(
        absolute(tenDaysAgo, { dateStyle: 'medium', timeStyle: 'short' }),
      ),
    ).toHaveAttribute('datetime', tenDaysAgo.toISOString());

    const relativeElement = screen.getByText('3 hours ago');
    expect(relativeElement.tagName).toBe('TIME');
    expect(relativeElement).toHaveAttribute(
      'datetime',
      threeHoursAgo.toISOString(),
    );

    rerender(<DateComponent value={threeHoursAgo} relative={false} />);
    expect(
      screen.getByText(
        absolute(threeHoursAgo, { dateStyle: 'medium', timeStyle: 'short' }),
      ),
    ).toBeInTheDocument();

    rerender(
      <DateComponent
        value={threeHoursAgo}
        relative={false}
        formatOptions={{ dateStyle: 'full' }}
      />,
    );
    expect(
      screen.getByText(absolute(threeHoursAgo, { dateStyle: 'full' })),
    ).toBeInTheDocument();
  });

  it('accepts strings and timestamps and falls back to the raw input for invalid values', () => {
    const iso = '2026-10-17T09:00:00.000Z';
    const timestamp = new Date(iso).getTime();

    render(
      <>
        <DateComponent value={iso} relative={false} />
        <DateComponent value={timestamp} relative={false} />
        <DateComponent value="not a date" />
      </>,
    );

    const expected = absolute(new Date(iso), {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const elements = screen.getAllByText(expected);
    expect(elements).toHaveLength(2);
    elements.forEach(element => {
      expect(element).toHaveAttribute('datetime', iso);
    });

    const invalid = screen.getByText('not a date');
    expect(invalid).not.toHaveAttribute('datetime');
    expect(invalid).not.toHaveAttribute('tabindex');
  });

  it('keeps relative dates up to date while mounted', () => {
    render(<DateComponent value={new Date(NOW.getTime() - 30 * 1000)} />);
    expect(screen.getByText('now')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2 * MINUTE);
    });
    expect(screen.getByText('2 minutes ago')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(HOUR);
    });
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
  });

  it('shows the absolute date, the raw input, or no tooltip', async () => {
    const iso = '2026-10-17T09:00:00.000Z';
    const date = new Date(iso);

    const { rerender } = render(<DateComponent value={iso} />);

    const absoluteTrigger = screen.getByText('3 hours ago');
    expect(absoluteTrigger).toHaveAttribute('tabindex', '0');
    await act(async () => {
      absoluteTrigger.focus();
    });
    expect(
      await screen.findByRole('tooltip', {
        name: absolute(date, { dateStyle: 'long', timeStyle: 'long' }),
      }),
    ).toBeInTheDocument();
    expect(absoluteTrigger).toHaveAccessibleDescription(
      absolute(date, { dateStyle: 'long', timeStyle: 'long' }),
    );

    rerender(<DateComponent value={iso} tooltip="input" />);
    const inputTrigger = screen.getByText('3 hours ago');
    await act(async () => {
      inputTrigger.blur();
      inputTrigger.focus();
    });
    expect(
      await screen.findByRole('tooltip', { name: iso }),
    ).toBeInTheDocument();

    rerender(<DateComponent value={date} tooltip="input" />);
    expect(
      await screen.findByRole('tooltip', { name: iso }),
    ).toBeInTheDocument();

    rerender(<DateComponent value={date} tooltip="none" />);
    const noneTrigger = screen.getByText('3 hours ago');
    expect(noneTrigger).not.toHaveAttribute('tabindex');
    await act(async () => {
      noneTrigger.focus();
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('formats dates in the locale of the surrounding I18nProvider', async () => {
    const threeHoursAgo = new Date(NOW.getTime() - 3 * HOUR);

    render(
      <I18nProvider locale="de-DE">
        <DateComponent value={threeHoursAgo} />
        <DateComponent value={threeHoursAgo} relative={false} />
      </I18nProvider>,
    );

    expect(screen.getByText('vor 3 Stunden')).toBeInTheDocument();
    expect(
      screen.getByText(
        new Intl.DateTimeFormat('de-DE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(threeHoursAgo),
      ),
    ).toBeInTheDocument();

    await act(async () => {
      screen.getByText('vor 3 Stunden').focus();
    });
    expect(
      await screen.findByRole('tooltip', {
        name: new Intl.DateTimeFormat('de-DE', {
          dateStyle: 'long',
          timeStyle: 'long',
        }).format(threeHoursAgo),
      }),
    ).toBeInTheDocument();
  });
});
