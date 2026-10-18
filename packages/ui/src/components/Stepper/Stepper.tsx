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

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import { Button as RAButton, type Key } from 'react-aria-components';
import { RiCheckLine } from '@remixicon/react';
import { useDefinition } from '../../hooks/useDefinition';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { Button } from '../Button';
import { VisuallyHidden } from '../VisuallyHidden';
import {
  StepperDefinition,
  StepListDefinition,
  StepDefinition,
  StepPanelDefinition,
  StepperPreviousButtonDefinition,
  StepperNextButtonDefinition,
} from './definition';
import { StepperContext, StepIndexContext, useStepper } from './StepperContext';
import type {
  StepperProps,
  StepListProps,
  StepProps,
  StepPanelProps,
  StepperPreviousButtonProps,
  StepperNextButtonProps,
  StepperState,
} from './types';

type RegisteredStep = {
  key: Key;
  isDisabled: boolean;
};

type StepRegistry = {
  steps: RegisteredStep[];
  setSteps: (steps: RegisteredStep[]) => void;
  baseId: string;
};

// Kept separate from the public state so that the registry does not leak
// into the `useStepper` hook.
const StepRegistryContext = createContext<StepRegistry | undefined>(undefined);

const useStepRegistry = (componentName: string) => {
  const registry = useContext(StepRegistryContext);
  if (!registry) {
    throw new Error(`${componentName} must be used within a Stepper component`);
  }
  return registry;
};

const stepElementId = (baseId: string, key: Key) => `${baseId}-step-${key}`;
const panelElementId = (baseId: string, key: Key) => `${baseId}-panel-${key}`;

/**
 * Keeps a value in sync between controlled and uncontrolled usage, in the same
 * way as the React Aria components do.
 */
function useControlledValue<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      if (next !== value) {
        onChange?.(next);
      }
    },
    [isControlled, onChange, value],
  );

  return [value, setValue] as const;
}

function collectSteps(children: ReactNode): RegisteredStep[] {
  return Children.toArray(children).flatMap<RegisteredStep>(child =>
    isValidElement<StepProps>(child) && child.props.id !== undefined
      ? [{ key: child.props.id, isDisabled: Boolean(child.props.isDisabled) }]
      : [],
  );
}

function sameSteps(a: RegisteredStep[], b: RegisteredStep[]) {
  return (
    a.length === b.length &&
    a.every(
      (step, index) =>
        step.key === b[index].key && step.isDisabled === b[index].isDisabled,
    )
  );
}

/**
 * Splits a multi step flow, such as a long form, into separate steps that the
 * user walks through one at a time.
 *
 * @remarks
 * A Stepper consists of a `StepList` that shows the progress, one `StepPanel`
 * per step with the content, and `StepperPreviousButton` and
 * `StepperNextButton` to move between the steps. Steps are laid out
 * horizontally by default, or vertically with `orientation="vertical"`.
 *
 * @example
 * ```tsx
 * <Stepper>
 *   <StepList aria-label="Create component">
 *     <Step id="details" title="Details" />
 *     <Step id="owner" title="Owner" />
 *     <Step id="review" title="Review" />
 *   </StepList>
 *   <StepPanel id="details">...</StepPanel>
 *   <StepPanel id="owner">...</StepPanel>
 *   <StepPanel id="review">...</StepPanel>
 *   <Flex justify="end">
 *     <StepperPreviousButton />
 *     <StepperNextButton />
 *   </Flex>
 * </Stepper>
 * ```
 *
 * @public
 */
export const Stepper = forwardRef(
  (props: StepperProps, ref: Ref<HTMLDivElement>) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      StepperDefinition,
      props,
    );
    const { classes, children } = ownProps;
    const {
      selectedKey: controlledSelectedKey,
      defaultSelectedKey,
      onSelectionChange,
      lastCompletedStep: controlledLastCompletedStep,
      defaultLastCompletedStep,
      onLastCompletedStepChange,
      isReadOnly = false,
      isDisabled = false,
      ...divProps
    } = restProps;

    const baseId = useId();
    const [steps, setStepsState] = useState<RegisteredStep[]>([]);
    const setSteps = useCallback((next: RegisteredStep[]) => {
      setStepsState(prev => (sameSteps(prev, next) ? prev : next));
    }, []);

    const stepKeys = useMemo(() => steps.map(step => step.key), [steps]);

    const handleSelectionChange = useCallback(
      (key: Key | null) => {
        if (key !== null) {
          onSelectionChange?.(key);
        }
      },
      [onSelectionChange],
    );

    const [selectedKeyState, setSelectedKeyState] =
      useControlledValue<Key | null>(
        controlledSelectedKey,
        defaultSelectedKey ?? null,
        handleSelectionChange,
      );
    const [lastCompletedStep, setLastCompletedStep] =
      useControlledValue<Key | null>(
        controlledLastCompletedStep,
        defaultLastCompletedStep ?? null,
        onLastCompletedStepChange,
      );

    // Fall back to the first step when nothing is selected yet.
    const selectedKey = selectedKeyState ?? stepKeys[0] ?? null;
    const selectedIndex =
      selectedKey === null ? -1 : stepKeys.indexOf(selectedKey);
    // Every step before the selected one always counts as completed, even
    // when the selected step was set directly without completing the ones
    // before it.
    const rawLastCompletedIndex =
      lastCompletedStep === null ? -1 : stepKeys.indexOf(lastCompletedStep);
    const lastCompletedIndex = Math.max(
      rawLastCompletedIndex,
      selectedIndex - 1,
    );

    // Persists the completed steps before the selection changes, so that they
    // stay reachable when the user navigates back to an earlier step.
    const commitCompletedSteps = useCallback(
      (upToIndex: number) => {
        const target = Math.max(upToIndex, lastCompletedIndex);
        if (target > rawLastCompletedIndex) {
          setLastCompletedStep(stepKeys[target]);
        }
      },
      [
        stepKeys,
        lastCompletedIndex,
        rawLastCompletedIndex,
        setLastCompletedStep,
      ],
    );

    const setSelectedKey = useCallback(
      (key: Key) => {
        const index = stepKeys.indexOf(key);
        if (index === -1 || key === selectedKey) {
          return;
        }
        commitCompletedSteps(index - 1);
        setSelectedKeyState(key);
      },
      [stepKeys, selectedKey, commitCompletedSteps, setSelectedKeyState],
    );

    const selectNextStep = useCallback(() => {
      if (selectedIndex === -1 || selectedIndex >= stepKeys.length - 1) {
        return;
      }
      commitCompletedSteps(selectedIndex);
      setSelectedKeyState(stepKeys[selectedIndex + 1]);
    }, [selectedIndex, stepKeys, commitCompletedSteps, setSelectedKeyState]);

    const selectPreviousStep = useCallback(() => {
      if (selectedIndex <= 0) {
        return;
      }
      commitCompletedSteps(-1);
      setSelectedKeyState(stepKeys[selectedIndex - 1]);
    }, [selectedIndex, stepKeys, commitCompletedSteps, setSelectedKeyState]);

    const isStepCompleted = useCallback(
      (key: Key) => {
        const index = stepKeys.indexOf(key);
        return index !== -1 && index <= lastCompletedIndex;
      },
      [stepKeys, lastCompletedIndex],
    );

    const isStepSelectable = useCallback(
      (key: Key) => {
        if (isDisabled || isReadOnly) {
          return false;
        }
        const index = stepKeys.indexOf(key);
        if (index === -1 || steps[index].isDisabled) {
          return false;
        }
        return index <= lastCompletedIndex + 1;
      },
      [isDisabled, isReadOnly, stepKeys, steps, lastCompletedIndex],
    );

    const state = useMemo<StepperState>(
      () => ({
        stepKeys,
        selectedKey,
        selectedIndex,
        lastCompletedStep: stepKeys[lastCompletedIndex] ?? null,
        isFirstStep: selectedIndex <= 0,
        isLastStep:
          selectedIndex === -1 || selectedIndex === stepKeys.length - 1,
        isReadOnly,
        isDisabled,
        setSelectedKey,
        setLastCompletedStep,
        selectNextStep,
        selectPreviousStep,
        isStepCompleted,
        isStepSelectable,
      }),
      [
        stepKeys,
        selectedKey,
        selectedIndex,
        lastCompletedIndex,
        isReadOnly,
        isDisabled,
        setSelectedKey,
        setLastCompletedStep,
        selectNextStep,
        selectPreviousStep,
        isStepCompleted,
        isStepSelectable,
      ],
    );

    const registry = useMemo<StepRegistry>(
      () => ({ steps, setSteps, baseId }),
      [steps, setSteps, baseId],
    );

    return (
      <StepperContext.Provider value={state}>
        <StepRegistryContext.Provider value={registry}>
          <div
            ref={ref}
            className={classes.root}
            {...dataAttributes}
            {...divProps}
          >
            {children}
          </div>
        </StepRegistryContext.Provider>
      </StepperContext.Provider>
    );
  },
);

Stepper.displayName = 'Stepper';

/**
 * The ordered list of steps in a Stepper. Renders an `<ol>` element, so pass
 * an `aria-label` that describes the flow.
 *
 * @public
 */
export const StepList = forwardRef(
  (props: StepListProps, ref: Ref<HTMLOListElement>) => {
    const { ownProps, restProps } = useDefinition(StepListDefinition, props);
    const { classes, children } = ownProps;
    const { setSteps } = useStepRegistry('StepList');

    // Register the steps in order so that the Stepper knows which step comes
    // next. A layout effect avoids a frame where the navigation buttons are
    // rendered without knowing about any steps.
    useIsomorphicLayoutEffect(() => {
      setSteps(collectSteps(children));
    }, [children, setSteps]);

    let stepIndex = -1;

    return (
      <ol ref={ref} className={classes.root} {...restProps}>
        {Children.toArray(children).map(child => {
          if (
            !isValidElement<StepProps>(child) ||
            child.props.id === undefined
          ) {
            return child;
          }
          stepIndex += 1;
          return (
            <StepIndexContext.Provider key={child.key} value={stepIndex}>
              {child}
            </StepIndexContext.Provider>
          );
        })}
      </ol>
    );
  },
);

StepList.displayName = 'StepList';

/**
 * A single step inside a StepList. Shows the step number, or a check mark once
 * the step is completed, next to the step title and description.
 *
 * @public
 */
export const Step = forwardRef((props: StepProps, ref: Ref<HTMLLIElement>) => {
  const { ownProps, restProps } = useDefinition(StepDefinition, props);
  const { classes, id, title, description, indicator, isDisabled, children } =
    ownProps;
  const index = useContext(StepIndexContext);
  const { baseId } = useStepRegistry('Step');
  const {
    selectedKey,
    isReadOnly,
    isDisabled: isStepperDisabled,
    isStepCompleted,
    isStepSelectable,
    setSelectedKey,
  } = useStepper();

  const isSelected = selectedKey === id;
  const isCompleted = isStepCompleted(id);
  const isSelectable = isStepSelectable(id);
  const isInteractive = !isReadOnly && !isStepperDisabled;
  const isTriggerDisabled = isStepperDisabled || isDisabled;

  const content: ReactNode = children ?? (
    <span className={classes.content}>
      {title !== undefined && <span className={classes.title}>{title}</span>}
      {title !== undefined && description !== undefined && ' '}
      {description !== undefined && (
        <span className={classes.description}>{description}</span>
      )}
    </span>
  );

  const indicatorElement = (
    <>
      <span className={classes.indicator} aria-hidden="true">
        {indicator ??
          (isCompleted && !isSelected ? <RiCheckLine /> : index + 1)}
      </span>
      <VisuallyHidden>
        {isCompleted ? `Step ${index + 1}, completed. ` : `Step ${index + 1}. `}
      </VisuallyHidden>
    </>
  );

  return (
    <li
      ref={ref}
      className={classes.root}
      data-selected={isSelected || undefined}
      data-completed={isCompleted || undefined}
      data-disabled={isTriggerDisabled || undefined}
      {...restProps}
    >
      {isInteractive ? (
        <RAButton
          id={stepElementId(baseId, id)}
          className={classes.trigger}
          isDisabled={isTriggerDisabled || !isSelectable}
          aria-current={isSelected ? 'step' : undefined}
          data-interactive={isSelectable || undefined}
          onPress={() => setSelectedKey(id)}
        >
          {indicatorElement}
          {content}
        </RAButton>
      ) : (
        <span
          id={stepElementId(baseId, id)}
          className={classes.trigger}
          aria-current={isSelected ? 'step' : undefined}
          data-disabled={isTriggerDisabled || undefined}
        >
          {indicatorElement}
          {content}
        </span>
      )}
      <span className={classes.connector} aria-hidden="true" />
    </li>
  );
});

Step.displayName = 'Step';

/**
 * The content of a single step. Only the panel of the selected step is
 * rendered, unless `shouldForceMount` is set.
 *
 * @public
 */
export const StepPanel = forwardRef(
  (props: StepPanelProps, ref: Ref<HTMLDivElement>) => {
    const { ownProps, restProps } = useDefinition(StepPanelDefinition, props);
    const { classes, id, shouldForceMount, children } = ownProps;
    const { baseId } = useStepRegistry('StepPanel');
    const { selectedKey } = useStepper();
    const isSelected = selectedKey === id;

    if (!isSelected && !shouldForceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        id={panelElementId(baseId, id)}
        role="group"
        aria-labelledby={stepElementId(baseId, id)}
        className={classes.root}
        hidden={!isSelected}
        data-selected={isSelected || undefined}
        {...restProps}
      >
        {children}
      </div>
    );
  },
);

StepPanel.displayName = 'StepPanel';

/**
 * A button that selects the previous step of the surrounding Stepper. It is
 * disabled on the first step.
 *
 * @public
 */
export const StepperPreviousButton = forwardRef(
  (props: StepperPreviousButtonProps, ref: Ref<HTMLButtonElement>) => {
    const { ownProps, restProps } = useDefinition(
      StepperPreviousButtonDefinition,
      props,
    );
    const { classes, children } = ownProps;
    const { isFirstStep, isDisabled, selectPreviousStep } = useStepper();

    return (
      <Button
        ref={ref}
        variant="secondary"
        {...restProps}
        className={classes.root}
        isDisabled={restProps.isDisabled || isDisabled || isFirstStep}
        onPress={event => {
          restProps.onPress?.(event);
          selectPreviousStep();
        }}
      >
        {children ?? 'Back'}
      </Button>
    );
  },
);

StepperPreviousButton.displayName = 'StepperPreviousButton';

/**
 * A button that selects the next step of the surrounding Stepper. It is
 * disabled on the last step.
 *
 * @public
 */
export const StepperNextButton = forwardRef(
  (props: StepperNextButtonProps, ref: Ref<HTMLButtonElement>) => {
    const { ownProps, restProps } = useDefinition(
      StepperNextButtonDefinition,
      props,
    );
    const { classes, children } = ownProps;
    const { isLastStep, isDisabled, selectNextStep } = useStepper();

    return (
      <Button
        ref={ref}
        variant="primary"
        {...restProps}
        className={classes.root}
        isDisabled={restProps.isDisabled || isDisabled || isLastStep}
        onPress={event => {
          restProps.onPress?.(event);
          selectNextStep();
        }}
      >
        {children ?? 'Next'}
      </Button>
    );
  },
);

StepperNextButton.displayName = 'StepperNextButton';
