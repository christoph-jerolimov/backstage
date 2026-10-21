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
import { ProgressBar } from 'react-aria-components';
import type { ProgressCircleProps } from './types';
import { useDefinition } from '../../hooks/useDefinition';
import { ProgressCircleDefinition } from './definition';

const RING_RADIUS = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const INDETERMINATE_ARC = 0.25;

/**
 * A circular progress indicator for an operation of unknown duration, or a ring that fills up as a known amount of work completes.
 *
 * @remarks
 * Without a `value` the circle is indeterminate and rotates continuously.
 * Pass `value` for a determinate ring, together with `minValue` and
 * `maxValue` when the range is not 0 to 100, and `showValueLabel` to print
 * the formatted value next to it. The circle is exposed to assistive
 * technologies as a progress bar and is announced with the `label` prop,
 * which defaults to "Loading". Its color is inherited from the surrounding
 * text, so it adapts to any container. For users that prefer reduced motion,
 * the rotation animation is disabled.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <ProgressCircle />
 * ```
 *
 * @example
 * With a custom size and label:
 * ```tsx
 * <ProgressCircle size="large" label="Loading entities" />
 * ```
 *
 * @example
 * Determinate progress with a value label:
 * ```tsx
 * <ProgressCircle label="Uploading" value={40} showValueLabel />
 * ```
 *
 * @public
 */
export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  (props, ref) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      ProgressCircleDefinition,
      props,
    );
    const { classes, label, showValueLabel, style } = ownProps;

    const hasExternalLabel =
      restProps['aria-label'] !== undefined ||
      restProps['aria-labelledby'] !== undefined;

    const isIndeterminate =
      restProps.isIndeterminate ?? restProps.value === undefined;

    return (
      <ProgressBar
        ref={ref}
        className={classes.root}
        style={style}
        aria-label={hasExternalLabel ? undefined : label}
        {...dataAttributes}
        data-indeterminate={isIndeterminate ? 'true' : 'false'}
        {...restProps}
        isIndeterminate={isIndeterminate}
      >
        {({ percentage, valueText }) => {
          const fraction = isIndeterminate
            ? INDETERMINATE_ARC
            : (percentage ?? 0) / 100;

          return (
            <>
              <svg
                className={classes.indicator}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className={classes.track}
                  cx="12"
                  cy="12"
                  r={RING_RADIUS}
                />
                <circle
                  className={classes.arc}
                  cx="12"
                  cy="12"
                  r={RING_RADIUS}
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - fraction)}
                />
              </svg>
              {showValueLabel && !isIndeterminate && (
                <span className={classes.value}>{valueText}</span>
              )}
            </>
          );
        }}
      </ProgressBar>
    );
  },
);

ProgressCircle.displayName = 'ProgressCircle';
