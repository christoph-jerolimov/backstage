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
import { RiLoader4Line } from '@remixicon/react';
import type { SpinnerProps } from './types';
import { useDefinition } from '../../hooks/useDefinition';
import { SpinnerDefinition } from './definition';

/**
 * An indeterminate loading indicator that signals an operation of unknown duration is in progress.
 *
 * @remarks
 * The spinner is exposed to assistive technologies as a progress bar and is
 * announced with the `label` prop, which defaults to "Loading". Its color is
 * inherited from the surrounding text, so it adapts to any container. For
 * users that prefer reduced motion, the rotation animation is disabled.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Spinner />
 * ```
 *
 * @example
 * With a custom size and label:
 * ```tsx
 * <Spinner size="large" label="Loading entities" />
 * ```
 *
 * @public
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (props, ref) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      SpinnerDefinition,
      props,
    );
    const { classes, label, style } = ownProps;

    const hasExternalLabel =
      restProps['aria-label'] !== undefined ||
      restProps['aria-labelledby'] !== undefined;

    return (
      <ProgressBar
        ref={ref}
        className={classes.root}
        style={style}
        isIndeterminate
        aria-label={hasExternalLabel ? undefined : label}
        {...dataAttributes}
        {...restProps}
      >
        <RiLoader4Line className={classes.icon} aria-hidden="true" />
      </ProgressBar>
    );
  },
);

Spinner.displayName = 'Spinner';
