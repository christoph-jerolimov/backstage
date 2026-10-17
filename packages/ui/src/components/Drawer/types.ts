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
  DialogTriggerProps as RADialogTriggerProps,
  ModalOverlayProps as RAModalProps,
  HeadingProps as RAHeadingProps,
} from 'react-aria-components';

/**
 * Props for the DrawerTrigger component.
 * @public
 */
export interface DrawerTriggerProps extends RADialogTriggerProps {}

/** @public */
export type DrawerOwnProps = {
  children?: ReactNode;
  className?: string;
  /**
   * The edge of the viewport the drawer slides in from.
   *
   * @defaultValue 'right'
   */
  placement?: 'left' | 'right';
  /**
   * The width of the drawer, in pixels (number) or CSS units (string).
   * The drawer never grows wider than the viewport.
   *
   * @defaultValue 400
   */
  width?: number | string;
  /**
   * Whether the drawer is non-modal. A non-modal drawer has no backdrop, does
   * not trap focus and does not block scrolling, so the rest of the page stays
   * interactive while it is open. Combine with `isDismissable={false}` for a
   * persistent side panel that only closes through its own controls.
   *
   * @defaultValue false
   */
  isNonModal?: boolean;
  /**
   * Whether to hide the backdrop behind a modal drawer. The drawer stays modal:
   * the page behind it is not interactive until the drawer closes. Has no
   * effect on a non-modal drawer, which never has a backdrop.
   *
   * @defaultValue false
   */
  hideBackdrop?: boolean;
  /**
   * Whether the drawer closes when the user interacts outside of it.
   *
   * @defaultValue true
   */
  isDismissable?: boolean;
  style?: React.CSSProperties;
};

/**
 * Props for the Drawer component.
 * @public
 */
export interface DrawerProps
  extends DrawerOwnProps,
    Omit<RAModalProps, keyof DrawerOwnProps> {}

/** @public */
export type DrawerHeaderOwnProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Props for the DrawerHeader component.
 * @public
 */
export interface DrawerHeaderProps
  extends DrawerHeaderOwnProps,
    Omit<RAHeadingProps, keyof DrawerHeaderOwnProps> {}

/** @public */
export type DrawerBodyOwnProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Props for the DrawerBody component.
 * @public
 */
export interface DrawerBodyProps
  extends DrawerBodyOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DrawerBodyOwnProps> {}

/** @public */
export type DrawerFooterOwnProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Props for the DrawerFooter component.
 * @public
 */
export interface DrawerFooterProps
  extends DrawerFooterOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DrawerFooterOwnProps> {}
