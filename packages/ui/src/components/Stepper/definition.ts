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
  StepperOwnProps,
  StepListOwnProps,
  StepOwnProps,
  StepPanelOwnProps,
  StepperPreviousButtonOwnProps,
  StepperNextButtonOwnProps,
} from './types';
import styles from './Stepper.module.css';

/**
 * Component definition for Stepper
 * @public
 */
export const StepperDefinition = defineComponent<StepperOwnProps>()({
  styles,
  classNames: {
    root: 'bui-Stepper',
  },
  propDefs: {
    orientation: { dataAttribute: true, default: 'horizontal' },
    placement: { dataAttribute: true, default: 'aside' },
    className: {},
    children: {},
  },
});

/**
 * Component definition for StepList
 * @public
 */
export const StepListDefinition = defineComponent<StepListOwnProps>()({
  styles,
  classNames: {
    root: 'bui-StepList',
  },
  propDefs: {
    className: {},
    children: {},
  },
});

/**
 * Component definition for Step
 * @public
 */
export const StepDefinition = defineComponent<StepOwnProps>()({
  styles,
  classNames: {
    root: 'bui-Step',
    trigger: 'bui-StepTrigger',
    indicator: 'bui-StepIndicator',
    content: 'bui-StepContent',
    title: 'bui-StepTitle',
    description: 'bui-StepDescription',
    connector: 'bui-StepConnector',
  },
  propDefs: {
    id: {},
    title: {},
    description: {},
    indicator: {},
    isDisabled: { default: false },
    children: {},
    className: {},
  },
});

/**
 * Component definition for StepPanel
 * @public
 */
export const StepPanelDefinition = defineComponent<StepPanelOwnProps>()({
  styles,
  classNames: {
    root: 'bui-StepPanel',
  },
  propDefs: {
    id: {},
    shouldForceMount: { default: false },
    className: {},
    children: {},
  },
});

/**
 * Component definition for StepperPreviousButton
 * @public
 */
export const StepperPreviousButtonDefinition =
  defineComponent<StepperPreviousButtonOwnProps>()({
    styles,
    classNames: {
      root: 'bui-StepperPreviousButton',
    },
    propDefs: {
      className: {},
      children: {},
    },
  });

/**
 * Component definition for StepperNextButton
 * @public
 */
export const StepperNextButtonDefinition =
  defineComponent<StepperNextButtonOwnProps>()({
    styles,
    classNames: {
      root: 'bui-StepperNextButton',
    },
    propDefs: {
      className: {},
      children: {},
    },
  });
