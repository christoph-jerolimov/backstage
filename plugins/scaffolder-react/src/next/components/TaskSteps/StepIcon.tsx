/*
 * Copyright 2023 The Backstage Authors
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

import { makeStyles } from '@material-ui/core/styles';
import {
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiSubtractLine,
} from '@remixicon/react';
import type { ScaffolderTaskStatus } from '../../../api';

const useStyles = makeStyles(
  {
    '@keyframes spin': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    spinner: {
      animation: '$spin 1s linear infinite',
    },
  },
  { name: 'ScaffolderReactStepIcon' },
);

/**
 * The indicator shown for a task step, based on the status of the step.
 * Returns `null` for steps that have not started yet, so that the step number
 * is shown instead.
 */
export const StepIcon = (props: { status: ScaffolderTaskStatus }) => {
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
};
