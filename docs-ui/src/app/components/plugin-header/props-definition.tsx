import { classNamePropDefs, type PropDef } from '@/utils/propDefs';
import { Chip } from '@/components/Chip';

export const headerPropDefs: Record<string, PropDef> = {
  icon: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Icon displayed before the title.',
  },
  title: {
    type: 'string',
    description: 'Main heading text for the header.',
  },
  titleLink: {
    type: 'string',
    description: 'URL the title links to when clicked.',
  },
  breadcrumbs: {
    type: 'complex',
    description: (
      <>
        Breadcrumb trail rendered in place of the title. The title stays
        available to screen readers. See{' '}
        <a href="/components/breadcrumbs">Breadcrumbs</a> for the behavior of
        the trail.
      </>
    ),
    complexType: {
      name: 'PluginHeaderBreadcrumbEntry[]',
      properties: {
        label: {
          type: 'string',
          required: true,
          description: 'Text shown for the entry.',
        },
        href: {
          type: 'string',
          required: true,
          description: 'URL the entry links to.',
        },
      },
    },
  },
  customActions: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Custom elements rendered in the toolbar area.',
  },
  tabs: {
    type: 'complex',
    description: 'Navigation tabs displayed below the toolbar.',
    complexType: {
      name: 'HeaderTab[]',
      properties: {
        id: {
          type: 'string',
          required: true,
          description: 'Unique identifier for the tab.',
        },
        label: {
          type: 'string',
          required: true,
          description: 'Display text for the tab.',
        },
        href: {
          type: 'string',
          required: true,
          description: 'URL to navigate to when tab is clicked.',
        },
        matchStrategy: {
          type: "'exact' | 'prefix'",
          required: false,
          description: (
            <>
              Route matching strategy. Use <Chip>exact</Chip> for exact path
              match, <Chip>prefix</Chip> if pathname starts with href.
            </>
          ),
        },
      },
    },
  },
  onTabSelectionChange: {
    type: 'enum',
    values: ['(key: Key) => void'],
    description: 'Handler called when the selected tab changes.',
  },
  ...classNamePropDefs,
};
