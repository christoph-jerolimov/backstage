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
  CollapsibleOwnProps,
  CollapsibleTriggerOwnProps,
  CollapsiblePanelOwnProps,
} from './types';
import styles from './Collapsible.module.css';

/**
 * Component definition for Collapsible
 * @public
 */
export const CollapsibleDefinition = defineComponent<CollapsibleOwnProps>()({
  styles,
  classNames: {
    root: 'bui-Collapsible',
  },
  propDefs: {
    children: {},
    className: {},
  },
});

/**
 * Component definition for CollapsibleTrigger
 * @public
 */
export const CollapsibleTriggerDefinition =
  defineComponent<CollapsibleTriggerOwnProps>()({
    styles,
    classNames: {
      root: 'bui-CollapsibleTrigger',
    },
    propDefs: {
      children: {},
      className: {},
    },
  });

/**
 * Component definition for CollapsiblePanel
 * @public
 */
export const CollapsiblePanelDefinition =
  defineComponent<CollapsiblePanelOwnProps>()({
    styles,
    classNames: {
      root: 'bui-CollapsiblePanel',
    },
    propDefs: {
      className: {},
    },
  });
