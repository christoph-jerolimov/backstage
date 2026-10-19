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

import type { CSSProperties } from 'react';
import type { ProgressBarProps } from 'react-aria-components';

/** @public */
export type SpinnerOwnProps = {
  /**
   * Size of the spinner
   * @defaultValue 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Accessible label announced to assistive technologies while the spinner is shown.
   * Only used when no `aria-label` or `aria-labelledby` is passed.
   * @defaultValue 'Loading'
   */
  label?: string;

  /**
   * Whether to render the formatted value, for example "40%", next to the
   * ring. Ignored while the spinner is indeterminate.
   * @defaultValue false
   */
  showValueLabel?: boolean;

  className?: string;
  style?: CSSProperties;
};

/** @public */
export interface SpinnerProps
  extends Omit<ProgressBarProps, 'children' | 'className' | 'style'>,
    SpinnerOwnProps {}
