/*
 * Copyright 2020 The Backstage Authors
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

import { ReactNode } from 'react';
import { Text } from '@backstage/ui';
import { RiCheckLine } from '@remixicon/react';
import {
  ArgoRolloutCanaryStep,
  SetWeightStep,
  PauseStep,
  AnalysisStep,
} from './types';
import styles from './StepsProgress.module.css';

interface StepsProgressProps {
  currentStepIndex: number;
  aborted: boolean;
  steps: ArgoRolloutCanaryStep[];
  children?: ReactNode;
}

const isSetWeightStep = (step: ArgoRolloutCanaryStep): step is SetWeightStep =>
  step.hasOwnProperty('setWeight');

const isPauseStep = (step: ArgoRolloutCanaryStep): step is PauseStep =>
  step.hasOwnProperty('pause');

const isAnalysisStep = (step: ArgoRolloutCanaryStep): step is AnalysisStep =>
  step.hasOwnProperty('analysis');

const createLabelForStep = (step: ArgoRolloutCanaryStep): ReactNode => {
  if (isSetWeightStep(step)) {
    return `setWeight ${step.setWeight}%`;
  } else if (isPauseStep(step)) {
    return step.pause.duration === undefined
      ? 'infinite pause'
      : `pause for ${step.pause.duration}`;
  } else if (isAnalysisStep(step)) {
    return (
      <div>
        <Text as="p">analysis templates:</Text>
        {step.analysis.templates.map((t, i) => (
          <Text as="p" key={i}>{`${t.templateName}${
            t.clusterScope ? ' (cluster scoped)' : ''
          }`}</Text>
        ))}
      </div>
    );
  }
  return 'unknown step';
};

type StepState = 'completed' | 'active' | 'pending';

interface StepProps {
  number: number;
  testId: string;
  state: StepState;
  label: ReactNode;
}

const Step = ({ number, testId, state, label }: StepProps) => {
  return (
    <li className={styles.step} data-state={state}>
      <div className={styles.indicator}>
        {state === 'completed' ? (
          <RiCheckLine size={16} aria-label="completed" />
        ) : (
          number
        )}
      </div>
      <div className={styles.label} data-testid={testId}>
        {label}
      </div>
    </li>
  );
};

export const StepsProgress = ({
  currentStepIndex,
  aborted,
  steps,
}: StepsProgressProps) => {
  // If the activeStep is greater/equal to the number of steps
  // Then the canary is being promoted
  // Increase the step index to mark the 'canary promoted' step as done also
  const activeStepIndex =
    currentStepIndex >= steps.length ? currentStepIndex + 1 : currentStepIndex;

  /*
   *  When the Rollout is aborted no step is active or completed,
   *  otherwise it appears to always be on the first step
   */
  const getState = (index: number): StepState => {
    if (aborted) {
      return 'pending';
    }
    if (index < activeStepIndex) {
      return 'completed';
    }
    if (index === activeStepIndex) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <ol className={styles.stepper}>
      {steps.map((step, i) => (
        <Step
          key={i}
          number={i + 1}
          testId={`step-${i}`}
          state={getState(i)}
          label={createLabelForStep(step)}
        />
      ))}
      <Step
        number={steps.length + 1}
        testId="step--1"
        state={getState(steps.length)}
        label="Canary promoted"
      />
    </ol>
  );
};
