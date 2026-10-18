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
import type {
  DisclosureProps as RADisclosureProps,
  ButtonProps as RAButtonProps,
  DisclosurePanelProps as RADisclosurePanelProps,
} from 'react-aria-components';

/**
 * Own props for the Collapsible component.
 * @public
 */
export type CollapsibleOwnProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Props for the Collapsible component.
 * @public
 */
export interface CollapsibleProps
  extends Omit<RADisclosureProps, 'children' | 'className'>,
    CollapsibleOwnProps {}

/**
 * Own props for the CollapsibleTrigger component.
 * @public
 */
export type CollapsibleTriggerOwnProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Props for the CollapsibleTrigger component.
 * @public
 */
export interface CollapsibleTriggerProps
  extends Omit<RAButtonProps, 'children' | 'className' | 'slot'>,
    CollapsibleTriggerOwnProps {}

/**
 * Own props for the CollapsiblePanel component.
 * @public
 */
export type CollapsiblePanelOwnProps = {
  className?: string;
};

/**
 * Props for the CollapsiblePanel component.
 * @public
 */
export interface CollapsiblePanelProps
  extends Omit<RADisclosurePanelProps, 'className'>,
    CollapsiblePanelOwnProps {}
