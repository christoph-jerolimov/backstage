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
import type { SpinnerOwnProps } from './types';
import styles from './Spinner.module.css';

/**
 * Component definition for Spinner
 * @public
 */
export const SpinnerDefinition = defineComponent<SpinnerOwnProps>()({
  styles,
  classNames: {
    root: 'bui-Spinner',
    icon: 'bui-SpinnerIcon',
    track: 'bui-SpinnerTrack',
    arc: 'bui-SpinnerArc',
    value: 'bui-SpinnerValue',
  },
  propDefs: {
    size: { dataAttribute: true, default: 'medium' },
    label: { default: 'Loading' },
    showValueLabel: { default: false },
    className: {},
    style: {},
  },
});
