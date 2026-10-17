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

import { forwardRef, useEffect, useMemo, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import {
  mergeProps,
  useDateFormatter,
  useFocusable,
  useLocale,
  useObjectRef,
} from 'react-aria';
import { useDefinition } from '../../hooks/useDefinition';
import { Tooltip, TooltipTrigger } from '../Tooltip';
import { DateDefinition } from './definition';
import type { DateProps } from './types';
import {
  getRefreshInterval,
  getRelativeTime,
  toDate,
  toInputString,
} from './utils';

const TOOLTIP_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
  timeStyle: 'long',
};

/**
 * A `<time>` element that can act as the trigger of a `TooltipTrigger`.
 *
 * `Focusable` from react-aria-components expects an interactive ARIA role on
 * its child, which a date does not have, so the focusable behavior is wired
 * up directly instead.
 */
const FocusableTime = forwardRef<
  HTMLTimeElement,
  ComponentPropsWithoutRef<'time'>
>((props, forwardedRef) => {
  const ref = useObjectRef(forwardedRef);
  const { focusableProps } = useFocusable({}, ref);
  return <time {...mergeProps(focusableProps, props)} ref={ref} />;
});

FocusableTime.displayName = 'FocusableTime';

/**
 * Displays a date in the user's locale, relative to the current time when it is close, with a tooltip showing the full date.
 *
 * @remarks
 *
 * The date is rendered as a `<time>` element whose `dateTime` attribute holds
 * the ISO 8601 timestamp. Formatting follows the locale provided by the
 * react-aria `I18nProvider`, falling back to the browser locale.
 *
 * Unless the tooltip is disabled, the date is focusable so that keyboard users
 * can reach the tooltip. Set `tooltip="none"` for dates in dense layouts such
 * as tables where an extra tab stop per date is undesirable.
 *
 * Importing this component as `Date` shadows the global `Date` object in that
 * module. Alias the import when you also need the global, for example
 * `import { Date as BUIDate } from '@backstage/ui'`.
 *
 * @example
 * ```tsx
 * import { Date } from '@backstage/ui';
 *
 * <Date value="2026-10-17T08:00:00Z" />
 * <Date value={entity.metadata.createdAt} relative={false} />
 * <Date value={1760688000000} tooltip="input" />
 * ```
 *
 * @public
 */
const DateComponent = forwardRef<HTMLTimeElement, DateProps>((props, ref) => {
  const { ownProps, restProps } = useDefinition(DateDefinition, props);
  const { classes, value, relative, tooltip, formatOptions } = ownProps;

  const { locale } = useLocale();
  const dateFormatter = useDateFormatter(formatOptions);
  const tooltipFormatter = useDateFormatter(TOOLTIP_FORMAT_OPTIONS);
  const relativeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
    [locale],
  );

  const date = useMemo(() => toDate(value), [value]);

  // Relative dates are computed against the current time on every render and
  // re-rendered periodically so that they stay accurate while mounted.
  const [, setTick] = useState(0);
  const relativeTime =
    relative && date ? getRelativeTime(date, new Date()) : undefined;
  const refreshInterval = getRefreshInterval(relativeTime);

  useEffect(() => {
    if (refreshInterval === undefined) {
      return undefined;
    }
    const id = setInterval(() => setTick(tick => tick + 1), refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval]);

  let displayText: string;
  if (!date) {
    displayText = toInputString(value);
  } else if (relativeTime) {
    displayText = relativeFormatter.format(
      relativeTime.value,
      relativeTime.unit,
    );
  } else {
    displayText = dateFormatter.format(date);
  }

  let tooltipText: string | undefined;
  if (date && tooltip === 'absolute') {
    tooltipText = tooltipFormatter.format(date);
  } else if (date && tooltip === 'input') {
    tooltipText = toInputString(value);
  }

  const timeProps = {
    className: classes.root,
    dateTime: date?.toISOString(),
    children: displayText,
    ...restProps,
  };

  if (tooltipText === undefined) {
    return <time ref={ref} {...timeProps} />;
  }

  return (
    <TooltipTrigger>
      <FocusableTime ref={ref} {...timeProps} />
      <Tooltip>{tooltipText}</Tooltip>
    </TooltipTrigger>
  );
});

DateComponent.displayName = 'Date';

export { DateComponent as Date };
