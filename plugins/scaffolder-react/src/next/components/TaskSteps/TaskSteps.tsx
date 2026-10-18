/*
 * Copyright 2022 The Backstage Authors
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
import { Step, StepList, Stepper } from '@backstage/ui';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { TaskStep } from '@backstage/plugin-scaffolder-common';
import { StepIcon } from './StepIcon';
import { StepTime } from './StepTime';
import { TaskBorder } from './TaskBorder';
import { ScaffolderStep } from '@backstage/plugin-scaffolder-react';

const useStyles = makeStyles(
  theme => ({
    completed: {
      '& .bui-StepIndicator': {
        color: theme.palette.common.white,
        backgroundColor: theme.palette.status.ok,
        borderColor: theme.palette.status.ok,
      },
    },
    error: {
      '& .bui-StepIndicator': {
        color: theme.palette.common.white,
        backgroundColor: theme.palette.status.error,
        borderColor: theme.palette.status.error,
      },
    },
  }),
  { name: 'ScaffolderReactTaskSteps' },
);

/**
 * Props for the TaskSteps component
 *
 * @alpha
 */
export interface TaskStepsProps {
  steps: (TaskStep & ScaffolderStep)[];
  activeStep?: number;
  isComplete?: boolean;
  isError?: boolean;
}

/**
 * The visual stepper of the task event stream
 *
 * @alpha
 */
export const TaskSteps = (props: TaskStepsProps) => {
  const classes = useStyles();
  const { steps, activeStep = 0 } = props;

  // Every step that has started counts as completed for the progress line,
  // the indicator of each step shows its actual status.
  const lastStartedStep = [...steps]
    .reverse()
    .find(step => step.status !== 'open');

  return (
    <Paper style={{ position: 'relative', overflow: 'hidden' }}>
      <TaskBorder
        isComplete={props.isComplete ?? false}
        isError={props.isError ?? false}
      />
      <Box padding={2}>
        <Stepper
          isReadOnly
          selectedKey={steps[activeStep]?.id}
          lastCompletedStep={lastStartedStep?.id ?? null}
        >
          <StepList>
            {steps.map(step => {
              const isSkipped = step.status === 'skipped';
              const isFailed =
                step.status === 'failed' || step.status === 'cancelled';
              return (
                <Step
                  key={step.id}
                  id={step.id}
                  className={classNames({
                    [classes.completed]: step.status === 'completed',
                    [classes.error]: isFailed,
                  })}
                  indicator={<StepIcon status={step.status} />}
                  title={step.name}
                  description={isSkipped ? undefined : <StepTime step={step} />}
                />
              );
            })}
          </StepList>
        </Stepper>
      </Box>
    </Paper>
  );
};
