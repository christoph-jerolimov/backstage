export const usage = `import { Breadcrumbs } from '@backstage/ui';

<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'my-service', href: '/services/my-service' },
  ]}
/>`;

export const defaultSnippet = `<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'my-service', href: '/services/my-service' },
  ]}
/>`;

export const singleItem = `<Breadcrumbs items={[{ label: 'Catalog', href: '/catalog' }]} />`;

export const withLongLabels = `<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    {
      label: 'Page with a very long title that should truncate',
      href: '/services/long',
    },
    {
      label: 'Current page with a very long title that should truncate at some point',
      href: '/services/long/another',
    },
  ]}
/>`;

export const withManyItems = `<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Guides', href: '/docs/guides' },
    { label: 'Setup', href: '/docs/guides/setup' },
    { label: 'Introduction', href: '/docs/guides/setup/introduction' },
  ]}
/>`;

export const inPluginHeader = `<PluginHeader
  title="my-service"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'my-service', href: '/services/my-service' },
  ]}
/>`;
