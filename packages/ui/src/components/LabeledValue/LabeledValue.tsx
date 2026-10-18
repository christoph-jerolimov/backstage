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

import { forwardRef } from 'react';
import { Focusable } from 'react-aria-components';
import type { LabeledValueProps } from './types';
import { useDefinition } from '../../hooks/useDefinition';
import { LabeledValueDefinition } from './definition';
import { Text } from '../Text';
import { Tooltip, TooltipTrigger } from '../Tooltip';

/**
 * Formats a value for display. Strings are returned as they are, numbers and
 * dates are formatted with the browser locale. The unformatted input is
 * returned as the tooltip when it differs from the formatted text.
 */
function formatValue(value: string | number | Date): {
  text: string;
  tooltip?: string;
} {
  if (typeof value === 'string') {
    return { text: value };
  }

  let text: string;
  let raw: string;
  if (typeof value === 'number') {
    text = value.toLocaleString();
    raw = String(value);
  } else if (Number.isNaN(value.getTime())) {
    text = String(value);
    raw = text;
  } else {
    text = value.toLocaleString();
    raw = value.toISOString();
  }

  return { text, tooltip: raw === text ? undefined : raw };
}

/**
 * Displays a value together with a label that describes it, either side by
 * side or stacked.
 *
 * @remarks
 *
 * Strings are rendered as they are. Numbers and dates are formatted with the
 * browser locale and show their unformatted input value in a tooltip. Any
 * other content is passed as children and rendered as the value.
 *
 * @example
 * ```tsx
 * <LabeledValue label="Owner" value="team-a" />
 * <LabeledValue label="Stars" value={1234567} />
 * <LabeledValue label="Created" value={new Date(entity.createdAt)} variant="vertical" />
 * <LabeledValue label="Status">
 *   <Badge>Running</Badge>
 * </LabeledValue>
 * ```
 *
 * @public
 */
export const LabeledValue = forwardRef<HTMLDivElement, LabeledValueProps>(
  (props, ref) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      LabeledValueDefinition,
      props,
    );
    const { classes, label, value, children } = ownProps;

    let content: React.ReactNode;
    if (value !== undefined && value !== null) {
      const { text, tooltip } = formatValue(value);
      content = tooltip ? (
        <TooltipTrigger>
          <Focusable>
            <Text as="span" variant="body-medium">
              {text}
            </Text>
          </Focusable>
          <Tooltip>{tooltip}</Tooltip>
        </TooltipTrigger>
      ) : (
        <Text as="span" variant="body-medium">
          {text}
        </Text>
      );
    } else if (typeof children === 'string') {
      content = (
        <Text as="span" variant="body-medium">
          {children}
        </Text>
      );
    } else {
      content = children;
    }

    return (
      <div
        ref={ref}
        className={classes.root}
        {...dataAttributes}
        {...restProps}
      >
        <Text
          as="div"
          variant="body-medium"
          color="secondary"
          className={classes.label}
        >
          {label}
        </Text>
        <div className={classes.value}>{content}</div>
      </div>
    );
  },
);

LabeledValue.displayName = 'LabeledValue';
