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
import { TaskBorder } from './TaskBorder';
import { render, screen } from '@testing-library/react';

describe('TaskBorder', () => {
  it('should render an indeterminate progress bar if the task is not complete', () => {
    render(<TaskBorder isComplete={false} isError={false} />);

    const progressBar = screen.getByRole('progressbar', {
      name: 'Task in progress',
    });

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).not.toHaveAttribute('aria-valuenow');
  });

  it('should render a full progress bar in the outcome color if the task is complete', () => {
    const { rerender } = render(<TaskBorder isComplete isError />);

    const failed = screen.getByRole('progressbar', { name: 'Task failed' });
    expect(failed).toHaveAttribute('aria-valuenow', '100');
    expect(failed).toHaveAttribute('data-color', 'danger');

    rerender(<TaskBorder isComplete isError={false} />);

    const completed = screen.getByRole('progressbar', {
      name: 'Task completed',
    });
    expect(completed).toHaveAttribute('aria-valuenow', '100');
    expect(completed).toHaveAttribute('data-color', 'success');
  });
});
