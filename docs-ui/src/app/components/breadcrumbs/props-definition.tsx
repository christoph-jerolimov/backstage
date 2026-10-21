import { classNamePropDefs, type PropDef } from '@/utils/propDefs';

export const breadcrumbsPropDefs: Record<string, PropDef> = {
  items: {
    type: 'complex',
    required: true,
    description:
      'Ordered entries from the root page to the current page. The last entry is treated as the current page.',
    complexType: {
      name: 'BreadcrumbItem[]',
      properties: {
        label: {
          type: 'string',
          required: true,
          description: 'Text shown for the entry.',
        },
        href: {
          type: 'string',
          required: true,
          description:
            'URL the entry links to. Relative URLs resolve against the current route.',
        },
      },
    },
  },
  'aria-label': {
    type: 'string',
    default: 'Breadcrumbs',
    description: 'Accessible name of the navigation landmark.',
  },
  ...classNamePropDefs,
};
