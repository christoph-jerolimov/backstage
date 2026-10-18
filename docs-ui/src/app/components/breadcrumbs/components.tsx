'use client';

import { Breadcrumbs } from '../../../../../packages/ui/src/components/Breadcrumbs/Breadcrumbs';
import { PluginHeader } from '../../../../../packages/ui/src/components/PluginHeader/PluginHeader';
import { MemoryRouter } from 'react-router-dom';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'my-service', href: '/services/my-service' },
];

export const Default = () => (
  <MemoryRouter>
    <Breadcrumbs items={items} />
  </MemoryRouter>
);

export const SingleItem = () => (
  <MemoryRouter>
    <Breadcrumbs items={[{ label: 'Catalog', href: '/catalog' }]} />
  </MemoryRouter>
);

export const WithLongLabels = () => (
  <MemoryRouter>
    <Breadcrumbs
      items={[
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
      ]}
    />
  </MemoryRouter>
);

export const WithManyItems = () => (
  <MemoryRouter>
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/' },
        { label: 'Docs', href: '/docs' },
        { label: 'Guides', href: '/docs/guides' },
        { label: 'Setup', href: '/docs/guides/setup' },
        { label: 'Introduction', href: '/docs/guides/setup/introduction' },
      ]}
    />
  </MemoryRouter>
);

export const InPluginHeader = () => (
  <MemoryRouter>
    <PluginHeader title="my-service" breadcrumbs={items} />
  </MemoryRouter>
);
