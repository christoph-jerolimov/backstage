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

import type { ReactNode } from 'react';
import type { Responsive } from '../../types';

/**
 * The layout variants of the LabeledValue component.
 *
 * @public
 */
export type LabeledValueVariant = 'horizontal' | 'vertical';

/**
 * The alignment options for the value of the LabeledValue component.
 *
 * @public
 */
export type LabeledValueAlign = 'start' | 'center' | 'end';

/**
 * Own props for the LabeledValue component.
 *
 * @public
 */
export type LabeledValueOwnProps = {
  /**
   * The label that describes the value.
   */
  label: ReactNode;

  /**
   * The value to display next to or below the label.
   *
   * Strings are rendered as they are. Numbers and dates are formatted with
   * the browser locale, and the unformatted input value is shown in a tooltip
   * when it differs from the formatted text.
   *
   * When no value is given, the children are rendered as the value instead.
   */
  value?: string | number | Date | null;

  /**
   * Custom content to render as the value when the `value` prop is not set.
   */
  children?: ReactNode;

  /**
   * The layout of the label and the value.
   *
   * - `horizontal` places the value next to the label.
   * - `vertical` places the value below the label.
   *
   * @defaultValue 'horizontal'
   */
  variant?: Responsive<LabeledValueVariant>;

  /**
   * Whether the value fills the remaining space next to the label.
   * Only applies to the `horizontal` variant.
   *
   * @defaultValue false
   */
  grow?: Responsive<boolean>;

  /**
   * The alignment of the value within the space available to it.
   * In the `horizontal` variant, combine it with `grow` to give the value
   * space to align in.
   *
   * @defaultValue 'start'
   */
  align?: Responsive<LabeledValueAlign>;

  className?: string;
};

/**
 * Props for the LabeledValue component.
 *
 * @public
 */
export interface LabeledValueProps
  extends LabeledValueOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof LabeledValueOwnProps> {}
