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

import type { ComponentPropsWithoutRef } from 'react';

/** @public */
export type DateOwnProps = {
  /**
   * The date to display. Accepts a `Date` object, a string that the `Date`
   * constructor can parse such as an ISO 8601 timestamp, or the number of
   * milliseconds since the Unix epoch.
   *
   * Values that cannot be parsed as a date are rendered as plain text.
   */
  value: Date | string | number;
  /**
   * Whether to show dates that are close to the current time relative to it,
   * for example "3 hours ago", "yesterday" or "in 5 minutes". Dates more than
   * seven days away from today are always shown as absolute dates. Relative
   * dates update automatically while the component is mounted.
   *
   * @defaultValue true
   */
  relative?: boolean;
  /**
   * What the tooltip shows when the date is hovered or focused.
   *
   * - `'absolute'` shows the full date and time, including the time zone.
   * - `'input'` shows the raw `value` as it was passed in. `Date` objects are
   *   shown as ISO 8601 timestamps.
   * - `'none'` shows no tooltip. The date is then not focusable either.
   *
   * @defaultValue 'absolute'
   */
  tooltip?: 'absolute' | 'input' | 'none';
  /**
   * Options for formatting the absolute date, passed to `Intl.DateTimeFormat`
   * together with the current locale.
   *
   * @defaultValue `{ dateStyle: 'medium', timeStyle: 'short' }`
   */
  formatOptions?: Intl.DateTimeFormatOptions;
  className?: string;
};

/** @public */
export interface DateProps
  extends Omit<
      ComponentPropsWithoutRef<'time'>,
      'children' | 'className' | 'dateTime'
    >,
    DateOwnProps {}
