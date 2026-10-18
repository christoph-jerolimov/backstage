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

import { defineComponent } from '../../hooks/useDefinition';
import type {
  DrawerOwnProps,
  DrawerHeaderOwnProps,
  DrawerBodyOwnProps,
  DrawerFooterOwnProps,
} from './types';
import styles from './Drawer.module.css';

/**
 * Component definition for Drawer
 * @public
 */
export const DrawerDefinition = defineComponent<DrawerOwnProps>()({
  styles,
  classNames: {
    root: 'bui-DrawerOverlay',
    container: 'bui-Drawer',
    inner: 'bui-DrawerInner',
    content: 'bui-DrawerContent',
  },
  propDefs: {
    children: {},
    className: {},
    placement: { dataAttribute: true, default: 'right' },
    width: {},
    height: {},
    isNonModal: { dataAttribute: true, default: false },
    hideBackdrop: { dataAttribute: true, default: false },
    isDismissable: { default: true },
    style: {},
  },
});

/**
 * Component definition for DrawerHeader
 * @public
 */
export const DrawerHeaderDefinition = defineComponent<DrawerHeaderOwnProps>()({
  styles,
  classNames: {
    root: 'bui-DrawerHeader',
    title: 'bui-DrawerHeaderTitle',
  },
  propDefs: {
    children: {},
    className: {},
  },
});

/**
 * Component definition for DrawerBody
 * @public
 */
export const DrawerBodyDefinition = defineComponent<DrawerBodyOwnProps>()({
  styles,
  classNames: {
    root: 'bui-DrawerBody',
  },
  propDefs: {
    children: {},
    className: {},
  },
});

/**
 * Component definition for DrawerFooter
 * @public
 */
export const DrawerFooterDefinition = defineComponent<DrawerFooterOwnProps>()({
  styles,
  classNames: {
    root: 'bui-DrawerFooter',
  },
  propDefs: {
    children: {},
    className: {},
  },
});
