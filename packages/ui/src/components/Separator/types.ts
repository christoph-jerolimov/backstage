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
import type { SeparatorProps as RASeparatorProps } from 'react-aria-components';
import type { MarginProps } from '../../types';

/** @public */
export type SeparatorOwnProps = {
  /**
   * The direction of the separator.
   *
   * A horizontal separator divides content stacked vertically and fills the
   * available width. A vertical separator divides content placed side by side
   * and stretches to the height of its flex container.
   *
   * @defaultValue 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: CSSProperties;
};

/**
 * Properties for {@link Separator}
 *
 * @public
 */
export interface SeparatorProps
  extends SeparatorOwnProps,
    MarginProps,
    Omit<RASeparatorProps, keyof SeparatorOwnProps | 'elementType'> {}
