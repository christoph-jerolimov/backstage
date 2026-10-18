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

import { ProgressBar } from '@backstage/ui';
import Box from '@material-ui/core/Box';
import { LinearProgressProps } from '@material-ui/core/LinearProgress';
import { useTheme } from '@material-ui/core/styles';
import { PropsWithChildren, useEffect, useState } from 'react';

/**
 * A linear progress indicator that is shown after a short delay, so that it
 * does not flash for operations that finish quickly.
 *
 * @remarks
 * The indicator is rendered with the Backstage UI `ProgressBar`. The `variant`,
 * `value`, `className`, `style`, `id` and `aria-*` props are honored; other
 * Material UI specific props such as `classes`, `color` and `valueBuffer` have
 * no effect.
 */
export function Progress(props: PropsWithChildren<LinearProgressProps>) {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    id,
    className,
    style,
    variant = 'indeterminate',
    value,
  } = props;
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handle = setTimeout(
      () => setIsVisible(true),
      theme.transitions.duration.short,
    );
    return () => clearTimeout(handle);
  }, [theme.transitions.duration.short]);

  return isVisible ? (
    <ProgressBar
      id={id}
      className={className}
      style={style}
      isIndeterminate={variant === 'indeterminate' || variant === 'query'}
      value={value}
      aria-label={ariaLabelledBy ? ariaLabel : ariaLabel ?? 'Loading'}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      data-testid="progress"
    />
  ) : (
    <Box display="none" data-testid="progress" />
  );
}
