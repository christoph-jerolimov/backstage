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

import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';

import { TaskStatusColumn } from './TaskStatusColumn';

describe('<TaskStatusColumn />', () => {
  it.each([
    ['open', null, true],
    ['processing', 'info', true],
    ['completed', 'success', false],
    ['cancelled', 'warning', false],
    ['failed', 'danger', false],
    ['skipped', null, false],
    ['unknown', null, false],
  ])(
    'should render the status %s as a badge',
    async (status, badgeStatus, isPending) => {
      await renderInTestApp(<TaskStatusColumn status={status} />);

      const badge = screen.getByText(status);
      expect(badge).toHaveClass('bui-Badge');
      expect(badge.getAttribute('data-status')).toBe(badgeStatus);
      expect(
        screen.queryByRole('progressbar', { name: 'Loading' }) !== null,
      ).toBe(isPending);
    },
  );
});
