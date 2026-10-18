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
import { Separator as RASeparator } from 'react-aria-components';
import { useDefinition } from '../../hooks/useDefinition';
import { SeparatorDefinition } from './definition';
import type { SeparatorProps } from './types';

/**
 * A thin line that visually and semantically separates content, either
 * horizontally between stacked sections or vertically between items placed
 * side by side.
 *
 * @remarks
 *
 * A horizontal separator renders as an `hr` element. A vertical separator
 * renders as a `div` with the `separator` role and `aria-orientation`
 * set, so assistive technologies announce it the same way.
 *
 * @example
 * ```tsx
 * <Separator my="4" />
 * <Flex align="center" gap="2">
 *   <Text>Left</Text>
 *   <Separator orientation="vertical" />
 *   <Text>Right</Text>
 * </Flex>
 * ```
 *
 * @public
 */
export const Separator = forwardRef<HTMLElement, SeparatorProps>(
  (props, ref) => {
    const { ownProps, restProps, dataAttributes, utilityStyle } = useDefinition(
      SeparatorDefinition,
      props,
    );
    const { classes, orientation, style } = ownProps;

    return (
      <RASeparator
        ref={ref}
        className={classes.root}
        orientation={orientation}
        style={{ ...utilityStyle, ...style }}
        {...dataAttributes}
        {...restProps}
      />
    );
  },
);

Separator.displayName = 'Separator';
