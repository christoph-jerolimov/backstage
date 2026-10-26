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
import type { ProgressBarOwnProps } from './types';
import styles from './ProgressBar.module.css';

/**
 * Component definition for ProgressBar
 * @public
 */
export const ProgressBarDefinition = defineComponent<ProgressBarOwnProps>()({
  styles,
  classNames: {
    root: 'bui-ProgressBar',
    header: 'bui-ProgressBarHeader',
    label: 'bui-ProgressBarLabel',
    value: 'bui-ProgressBarValue',
    track: 'bui-ProgressBarTrack',
    fill: 'bui-ProgressBarFill',
  },
  bg: 'consumer',
  propDefs: {
    size: { dataAttribute: true, default: 'medium' },
    color: { dataAttribute: true, default: 'primary' },
    label: {},
    showValueLabel: { default: false },
    className: {},
    style: {},
  },
});
