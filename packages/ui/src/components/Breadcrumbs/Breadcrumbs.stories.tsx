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

import preview from '../../../../../.storybook/preview';
import { Breadcrumbs } from '.';
import { MemoryRouter } from 'react-router-dom';
import { BUIProvider } from '../../provider';

const meta = preview.meta({
  title: 'Backstage UI/Breadcrumbs',
  component: Breadcrumbs,
  argTypes: {
    'aria-label': {
      control: { type: 'text' },
    },
  },
  decorators: [
    Story => (
      <MemoryRouter>
        <BUIProvider>
          <Story />
        </BUIProvider>
      </MemoryRouter>
    ),
  ],
});

export const Default = meta.story({
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'my-service', href: '/services/my-service' },
    ],
  },
});

export const SingleItem = meta.story({
  args: {
    items: [{ label: 'Catalog', href: '/catalog' }],
  },
});

export const WithLongLabels = meta.story({
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      {
        label: 'Page with a very long title that should truncate',
        href: '/services/long',
      },
      {
        label:
          'Current page with a very long title that should truncate at some point',
        href: '/services/long/another',
      },
    ],
  },
});

export const WithManyItems = meta.story({
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Docs', href: '/docs' },
      { label: 'Guides', href: '/docs/guides' },
      { label: 'Setup', href: '/docs/guides/setup' },
      { label: 'Introduction', href: '/docs/guides/setup/introduction' },
    ],
  },
});

export const Constrained = meta.story({
  args: WithLongLabels.input.args,
  render: args => (
    <div style={{ width: 360, border: '1px dashed var(--bui-border-1)' }}>
      <Breadcrumbs {...args} />
    </div>
  ),
});
