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

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Dates within this many calendar days of today are shown relative to now.
 */
const RELATIVE_DAYS_THRESHOLD = 7;

export type RelativeTime = {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
};

/**
 * Converts the accepted input types into a `Date`, or returns `undefined`
 * when the input cannot be parsed as a date.
 */
export function toDate(value: Date | string | number): Date | undefined {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Returns the raw input as a string. Valid `Date` objects are shown as ISO
 * 8601 timestamps since they have no other string representation of the input.
 */
export function toInputString(value: Date | string | number): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return String(value);
}

function calendarDaysBetween(from: Date, to: Date): number {
  const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  // Rounding keeps the result stable across daylight saving time changes.
  return Math.round((toDay.getTime() - fromDay.getTime()) / DAY);
}

/**
 * Returns the distance between `now` and `date` in the largest unit that
 * fits, or `undefined` when the date is too far away to be shown relatively.
 */
export function getRelativeTime(
  date: Date,
  now: Date,
): RelativeTime | undefined {
  const diff = date.getTime() - now.getTime();
  const distance = Math.abs(diff);

  if (distance < MINUTE) {
    return { value: 0, unit: 'second' };
  }
  if (distance < HOUR) {
    return { value: Math.trunc(diff / MINUTE), unit: 'minute' };
  }
  if (distance < DAY) {
    return { value: Math.trunc(diff / HOUR), unit: 'hour' };
  }

  const days = calendarDaysBetween(now, date);
  if (Math.abs(days) <= RELATIVE_DAYS_THRESHOLD) {
    return { value: days, unit: 'day' };
  }

  return undefined;
}

/**
 * How often a relative date needs to be re-rendered to stay accurate.
 */
export function getRefreshInterval(
  relativeTime: RelativeTime | undefined,
): number | undefined {
  switch (relativeTime?.unit) {
    case 'second':
    case 'minute':
    case 'hour':
      return MINUTE;
    case 'day':
      return HOUR;
    default:
      return undefined;
  }
}
