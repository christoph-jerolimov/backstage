import {
  classNamePropDefs,
  stylePropDefs,
  createSpacingGroup,
  type PropDef,
} from '@/utils/propDefs';

export const separatorPropDefs: Record<string, PropDef> = {
  orientation: {
    type: 'enum',
    values: ['horizontal', 'vertical'],
    default: 'horizontal',
    description:
      'The direction of the separator. A horizontal separator fills the available width. A vertical separator stretches to the height of its flex container.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
  spacing: createSpacingGroup(
    ['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'],
    'Margin properties for controlling the space around the separator.',
  ),
};
