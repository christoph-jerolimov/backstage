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
import type { ProgressBarProps as AriaProgressBarProps } from 'react-aria-components';

/** @public */
export type ProgressBarOwnProps = {
  /**
   * Visible label rendered above the bar. It also serves as the accessible
   * name of the progress bar.
   */
  label?: string;

  /**
   * Whether to render the formatted value, for example "40%", next to the label.
   * Ignored while the bar is indeterminate.
   * @defaultValue false
   */
  showValueLabel?: boolean;

  /**
   * Height of the bar
   * @defaultValue 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Color of the filled portion of the bar
   * @defaultValue 'primary'
   */
  color?: 'primary' | 'success' | 'warning' | 'danger';

  className?: string;
  style?: CSSProperties;
};

/** @public */
export interface ProgressBarProps
  extends Omit<AriaProgressBarProps, 'children' | 'className' | 'style'>,
    ProgressBarOwnProps {}
