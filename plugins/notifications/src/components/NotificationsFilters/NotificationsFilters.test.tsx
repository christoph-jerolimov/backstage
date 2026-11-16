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
import { renderInTestApp } from '@backstage/test-utils';
import { fireEvent, screen } from '@testing-library/react';
import {
  NotificationsFilters,
  NotificationsFiltersProps,
  SortByOptions,
} from './NotificationsFilters';

describe('NotificationsFilters', () => {
  const props: NotificationsFiltersProps = {
    unreadOnly: true,
    onUnreadOnlyChanged: jest.fn(),
    createdAfter: 'all',
    onCreatedAfterChanged: jest.fn(),
    sorting: SortByOptions.newest.sortBy,
    onSortingChanged: jest.fn(),
    onSavedChanged: jest.fn(),
    severity: 'low',
    onSeverityChanged: jest.fn(),
    onTopicChanged: jest.fn(),
    allTopics: ['topic-b', 'topic-a'],
    onOriginChanged: jest.fn(),
    allOrigins: ['plugin:scaffolder', 'plugin:catalog'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists the origins and reports the selected one', async () => {
    const { rerender } = await renderInTestApp(
      <NotificationsFilters {...props} />,
    );

    expect(screen.getByLabelText('Origin')).toHaveTextContent('Any origin');
    fireEvent.click(screen.getByLabelText('Origin'));
    const options = await screen.findAllByRole('option');
    expect(options.map(option => option.textContent)).toEqual([
      'Any origin',
      'plugin:catalog',
      'plugin:scaffolder',
    ]);

    fireEvent.click(options[2]);
    expect(props.onOriginChanged).toHaveBeenCalledTimes(1);
    expect(props.onOriginChanged).toHaveBeenLastCalledWith('plugin:scaffolder');
    expect(props.onTopicChanged).not.toHaveBeenCalled();

    rerender(<NotificationsFilters {...props} origin="plugin:scaffolder" />);
    expect(screen.getByLabelText('Origin')).toHaveTextContent(
      'plugin:scaffolder',
    );
    fireEvent.click(screen.getByLabelText('Origin'));
    fireEvent.click((await screen.findAllByRole('option'))[0]);
    expect(props.onOriginChanged).toHaveBeenCalledTimes(2);
    expect(props.onOriginChanged).toHaveBeenLastCalledWith(undefined);
  });

  it('only offers any origin when no origins are known', async () => {
    await renderInTestApp(
      <NotificationsFilters {...props} allOrigins={undefined} />,
    );

    fireEvent.click(screen.getByLabelText('Origin'));
    expect(
      (await screen.findAllByRole('option')).map(option => option.textContent),
    ).toEqual(['Any origin']);
  });
});
