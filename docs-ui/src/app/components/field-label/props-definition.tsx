import {
  classNamePropDefs,
  stylePropDefs,
  type PropDef,
} from '@/utils/propDefs';
import { Chip } from '@/components/Chip';

export const fieldLabelPropDefs: Record<string, PropDef> = {
  label: {
    type: 'string',
    description:
      'Visible label text. When omitted, the component renders nothing.',
  },
  secondaryLabel: {
    type: 'string',
    description:
      'Secondary text shown in parentheses after the label, for example "Required" or "Optional".',
  },
  description: {
    type: 'string',
    description: 'Help text displayed below the label.',
  },
  htmlFor: {
    type: 'string',
    description:
      'The id of the input element the label is associated with. Use it when the label is not rendered inside a React Aria field component.',
  },
  id: {
    type: 'string',
    description: (
      <>
        The id of the label element. Useful together with{' '}
        <Chip>aria-labelledby</Chip> on a custom input.
      </>
    ),
  },
  descriptionId: {
    type: 'string',
    description: (
      <>
        The id of the description element. Reference it from{' '}
        <Chip>aria-describedby</Chip> on a custom input.
      </>
    ),
  },
  descriptionSlot: {
    type: 'string',
    description: (
      <>
        Slot name set on the description. Pass <Chip>description</Chip> inside a
        React Aria field component to connect the description to the input
        automatically.
      </>
    ),
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};
