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

import type { HTMLAttributes, ReactNode } from 'react';
import type { Key } from 'react-aria-components';
import type { ButtonProps } from '../Button/types';

/**
 * Layout direction of a {@link Stepper}.
 *
 * @public
 */
export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Own props for the Stepper component.
 *
 * @public
 */
export type StepperOwnProps = {
  /**
   * Whether the steps are laid out in a row or in a column.
   * @defaultValue 'horizontal'
   */
  orientation?: StepperOrientation;
  className?: string;
  children?: ReactNode;
};

/**
 * Props for the Stepper component.
 *
 * @public
 */
export interface StepperProps
  extends StepperOwnProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      keyof StepperOwnProps | 'defaultValue'
    > {
  /**
   * The id of the selected step (controlled).
   */
  selectedKey?: Key | null;
  /**
   * The id of the step that is selected on initial render (uncontrolled).
   * Defaults to the first step.
   */
  defaultSelectedKey?: Key;
  /**
   * Called when the selected step changes, either because the user activated
   * a step or because a previous or next button was pressed.
   */
  onSelectionChange?: (key: Key) => void;
  /**
   * The id of the last completed step (controlled). Steps up to and including
   * this one are marked as completed, and the step directly after it is the
   * furthest step the user can select.
   */
  lastCompletedStep?: Key | null;
  /**
   * The id of the last completed step on initial render (uncontrolled).
   */
  defaultLastCompletedStep?: Key;
  /**
   * Called when the last completed step changes. The last completed step
   * advances automatically whenever a later step gets selected.
   */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /**
   * Whether the user can select steps directly from the step list. When
   * read-only, navigation is only possible with the previous and next buttons
   * or programmatically.
   * @defaultValue false
   */
  isReadOnly?: boolean;
  /**
   * Whether the whole stepper is disabled.
   * @defaultValue false
   */
  isDisabled?: boolean;
}

/**
 * Own props for the StepList component.
 *
 * @public
 */
export type StepListOwnProps = {
  className?: string;
  children?: ReactNode;
};

/**
 * Props for the StepList component.
 *
 * @public
 */
export interface StepListProps
  extends StepListOwnProps,
    Omit<HTMLAttributes<HTMLOListElement>, keyof StepListOwnProps> {}

/**
 * Own props for the Step component.
 *
 * @public
 */
export type StepOwnProps = {
  /**
   * The unique id of the step. Used to match the step with its StepPanel.
   */
  id: Key;
  /**
   * The title of the step.
   */
  title?: ReactNode;
  /**
   * Optional secondary text displayed below the title.
   */
  description?: ReactNode;
  /**
   * Custom content for the step indicator, for example a status icon. Replaces
   * the step number and the check mark of completed steps.
   */
  indicator?: ReactNode;
  /**
   * Whether this step can be selected by the user.
   * @defaultValue false
   */
  isDisabled?: boolean;
  /**
   * Custom step content. When provided, `title` and `description` are
   * ignored.
   */
  children?: ReactNode;
  className?: string;
};

/**
 * Props for the Step component.
 *
 * @public
 */
export interface StepProps
  extends StepOwnProps,
    Omit<HTMLAttributes<HTMLLIElement>, keyof StepOwnProps> {}

/**
 * Own props for the StepPanel component.
 *
 * @public
 */
export type StepPanelOwnProps = {
  /**
   * The id of the step this panel belongs to.
   */
  id: Key;
  /**
   * Whether to keep the panel mounted while another step is selected. Useful
   * to preserve form state when the user navigates back and forth.
   * @defaultValue false
   */
  shouldForceMount?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Props for the StepPanel component.
 *
 * @public
 */
export interface StepPanelProps
  extends StepPanelOwnProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof StepPanelOwnProps> {}

/**
 * Own props for the StepperPreviousButton component.
 *
 * @public
 */
export type StepperPreviousButtonOwnProps = {
  className?: string;
  /**
   * The button label.
   * @defaultValue 'Back'
   */
  children?: ReactNode;
};

/**
 * Props for the StepperPreviousButton component.
 *
 * @public
 */
export interface StepperPreviousButtonProps
  extends StepperPreviousButtonOwnProps,
    Omit<ButtonProps, keyof StepperPreviousButtonOwnProps> {}

/**
 * Own props for the StepperNextButton component.
 *
 * @public
 */
export type StepperNextButtonOwnProps = {
  className?: string;
  /**
   * The button label.
   * @defaultValue 'Next'
   */
  children?: ReactNode;
};

/**
 * Props for the StepperNextButton component.
 *
 * @public
 */
export interface StepperNextButtonProps
  extends StepperNextButtonOwnProps,
    Omit<ButtonProps, keyof StepperNextButtonOwnProps> {}

/**
 * State and actions of the surrounding {@link Stepper}, returned by
 * {@link useStepper}.
 *
 * @public
 */
export interface StepperState {
  /**
   * The ids of all steps, in order.
   */
  stepKeys: Key[];
  /**
   * The id of the selected step, or `null` when there are no steps.
   */
  selectedKey: Key | null;
  /**
   * The index of the selected step, or `-1` when there are no steps.
   */
  selectedIndex: number;
  /**
   * The id of the last completed step, or `null` when no step is completed.
   */
  lastCompletedStep: Key | null;
  /**
   * Whether the first step is selected.
   */
  isFirstStep: boolean;
  /**
   * Whether the last step is selected.
   */
  isLastStep: boolean;
  /**
   * Whether the stepper is read-only.
   */
  isReadOnly: boolean;
  /**
   * Whether the stepper is disabled.
   */
  isDisabled: boolean;
  /**
   * Selects the given step. Steps before it are marked as completed.
   */
  setSelectedKey: (key: Key) => void;
  /**
   * Marks the given step, and every step before it, as completed. Pass `null`
   * to reset all steps.
   */
  setLastCompletedStep: (key: Key | null) => void;
  /**
   * Selects the next step, if any.
   */
  selectNextStep: () => void;
  /**
   * Selects the previous step, if any.
   */
  selectPreviousStep: () => void;
  /**
   * Whether the given step is completed.
   */
  isStepCompleted: (key: Key) => boolean;
  /**
   * Whether the user can select the given step from the step list.
   */
  isStepSelectable: (key: Key) => boolean;
}
