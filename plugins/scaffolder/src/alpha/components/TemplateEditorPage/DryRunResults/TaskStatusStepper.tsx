/*
 * Copyright 2024 The Backstage Authors
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
import { memo, useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Step, StepList, Stepper } from '@backstage/ui';
import { ScaffolderTaskStatus } from '@backstage/plugin-scaffolder-react';
import Typography from '@material-ui/core/Typography';
import {
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiSubtractLine,
} from '@remixicon/react';
import { DateTime, Interval } from 'luxon';
import useInterval from 'react-use/esm/useInterval';
import humanizeDuration from 'humanize-duration';
import classNames from 'classnames';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { scaffolderTranslationRef } from '../../../../translation';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
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
    '@keyframes spin': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    spinner: {
      animation: '$spin 1s linear infinite',
    },
  }),
);

type TaskStep = {
  id: string;
  name: string;
  status: ScaffolderTaskStatus;
  startedAt?: string;
  endedAt?: string;
};

const StepTimeTicker = ({ step }: { step: TaskStep }) => {
  const [time, setTime] = useState('');

  useInterval(() => {
    if (!step.startedAt) {
      setTime('');
      return;
    }

    const end = step.endedAt
      ? DateTime.fromISO(step.endedAt)
      : DateTime.local();

    const startedAt = DateTime.fromISO(step.startedAt);
    const formatted = Interval.fromDateTimes(startedAt, end)
      .toDuration()
      .valueOf();

    setTime(humanizeDuration(formatted, { round: true }));
  }, 1000);

  return <Typography variant="caption">{time}</Typography>;
};

function TaskStepIcon(props: { status: ScaffolderTaskStatus }) {
  const classes = useStyles();

  switch (props.status) {
    case 'processing':
      return <RiLoader4Line className={classes.spinner} />;
    case 'completed':
      return <RiCheckLine />;
    case 'failed':
    case 'cancelled':
      return <RiCloseLine />;
    case 'skipped':
      return <RiSubtractLine />;
    default:
      return null;
  }
}

export const TaskStatusStepper = memo(
  (props: {
    steps: TaskStep[];
    currentStepId: string | undefined;
    onUserStepChange: (id: string) => void;
    classes?: {
      root?: string;
    };
  }) => {
    const { steps, currentStepId, onUserStepChange } = props;
    const classes = useStyles(props);
    const { t } = useTranslationRef(scaffolderTranslationRef);

    // Every step that has started can be selected to show its logs.
    const lastStartedStep = [...steps]
      .reverse()
      .find(step => step.status !== 'open');

    return (
      <Stepper
        orientation="vertical"
        className={classes.root}
        selectedKey={currentStepId}
        lastCompletedStep={lastStartedStep?.id ?? null}
        onSelectionChange={key => onUserStepChange(String(key))}
      >
        <StepList>
          {steps.map(step => {
            const isFailed =
              step.status === 'failed' || step.status === 'cancelled';
            const isSkipped = step.status === 'skipped';

            return (
              <Step
                key={step.id}
                id={step.id}
                className={classNames({
                  [classes.completed]: step.status === 'completed',
                  [classes.error]: isFailed,
                })}
                indicator={<TaskStepIcon status={step.status} />}
                title={step.name}
                description={
                  isSkipped ? (
                    <Typography variant="caption">
                      {t(
                        'templateEditorPage.taskStatusStepper.skippedStepTitle',
                      )}
                    </Typography>
                  ) : (
                    <StepTimeTicker step={step} />
                  )
                }
              />
            );
          })}
        </StepList>
      </Stepper>
    );
  },
);
