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
import { ProgressBar as AriaProgressBar, Label } from 'react-aria-components';
import type { ProgressBarProps } from './types';
import { useDefinition } from '../../hooks/useDefinition';
import { ProgressBarDefinition } from './definition';

/**
 * A horizontal bar that shows how far an operation has progressed, or that an operation of unknown duration is running.
 *
 * @remarks
 * Pass `value` for a determinate bar, together with `minValue` and
 * `maxValue` when the range is not 0 to 100. Pass `isIndeterminate` for an
 * operation of unknown duration; the fill then animates across the track.
 * The bar is exposed to assistive technologies as a progress bar. Its
 * accessible name comes from `label`, `aria-label` or `aria-labelledby`,
 * and falls back to "Loading" when none is given. The animation of an
 * indeterminate bar is disabled for users that prefer reduced motion.
 *
 * @example
 * Determinate progress with a visible label and value:
 * ```tsx
 * <ProgressBar label="Uploading" value={40} showValueLabel />
 * ```
 *
 * @example
 * Indeterminate progress:
 * ```tsx
 * <ProgressBar isIndeterminate aria-label="Loading entities" />
 * ```
 *
 * @public
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (props, ref) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      ProgressBarDefinition,
      props,
    );
    const { classes, label, showValueLabel, style } = ownProps;

    const hasExternalLabel =
      restProps['aria-label'] !== undefined ||
      restProps['aria-labelledby'] !== undefined;

    return (
      <AriaProgressBar
        ref={ref}
        className={classes.root}
        style={style}
        aria-label={label || hasExternalLabel ? undefined : 'Loading'}
        {...dataAttributes}
        {...restProps}
      >
        {({ percentage, valueText, isIndeterminate }) => (
          <>
            {(label || (showValueLabel && !isIndeterminate)) && (
              <div className={classes.header}>
                {label && <Label className={classes.label}>{label}</Label>}
                {showValueLabel && !isIndeterminate && (
                  <span className={classes.value}>{valueText}</span>
                )}
              </div>
            )}
            <div className={classes.track}>
              <div
                className={classes.fill}
                data-indeterminate={isIndeterminate ? 'true' : undefined}
                style={
                  isIndeterminate ? undefined : { width: `${percentage ?? 0}%` }
                }
              />
            </div>
          </>
        )}
      </AriaProgressBar>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';
