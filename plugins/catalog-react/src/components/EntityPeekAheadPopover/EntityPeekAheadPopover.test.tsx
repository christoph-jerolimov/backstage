/*
 * Copyright 2021 The Backstage Authors
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

import { screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { EntityPeekAheadPopover } from './EntityPeekAheadPopover';
import { ApiProvider } from '@backstage/core-app-api';
import { TestApiRegistry, renderInTestApp } from '@backstage/test-utils';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { catalogApiRef } from '../../api';
import { Button } from '@backstage/ui';
import { entityRouteRef } from '../../routes';

const catalogApi = catalogApiMock({
  entities: [
    {
      apiVersion: '',
      kind: 'Component',
      metadata: {
        namespace: 'default',
        name: 'service1',
        description: 'The first service',
        tags: ['java', 'spring', 'kotlin', 'gradle', 'jvm', 'backend'],
      },
      spec: {
        type: 'service',
      },
    },
  ],
});

const apis = TestApiRegistry.from([catalogApiRef, catalogApi]);

describe('<EntityPeekAheadPopover/>', () => {
  it('renders all owners', async () => {
    await renderInTestApp(
      <ApiProvider apis={apis}>
        <EntityPeekAheadPopover entityRef="component:default/service1">
          <Button data-testid="popover1">s1</Button>
        </EntityPeekAheadPopover>
        <EntityPeekAheadPopover entityRef="component:default/service2">
          <Button data-testid="popover2">s2</Button>
        </EntityPeekAheadPopover>
      </ApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );
    expect(screen.getByText('s1')).toBeInTheDocument();
    expect(screen.queryByText('service1')).toBeNull();
    await user.hover(screen.getByTestId('popover1'));
    expect(await screen.findByText('service1')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('Component')).toBeInTheDocument();
    expect(screen.getByText('The first service')).toBeInTheDocument();
    expect(screen.getByText('service')).toBeInTheDocument();
    expect(screen.getByRole('row', { name: 'java' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: 'gradle' })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: 'jvm' })).toBeNull();
    expect(screen.getByRole('link', { name: '+2' })).toHaveAttribute(
      'href',
      '/catalog/default/Component/service1',
    );
    expect(screen.getByRole('link', { name: 'Show' })).toHaveAttribute(
      'href',
      '/catalog/default/Component/service1',
    );

    expect(screen.getByText('s2')).toBeInTheDocument();
    expect(screen.queryByText('service2')).toBeNull();
    await user.hover(screen.getByTestId('popover2'));
    expect(
      await screen.findByText('component:default/service2 not found'),
    ).toBeInTheDocument();
  });
});
