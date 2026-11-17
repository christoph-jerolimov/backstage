import {
  classNamePropDefs,
  stylePropDefs,
  type PropDef,
} from '@/utils/propDefs';

export const fieldErrorPropDefs: Record<string, PropDef> = {
  children: {
    type: 'enum',
    values: ['ReactNode', '(values: FieldErrorRenderProps) => ReactNode'],
    description:
      'The error message. When omitted, the validation errors of the surrounding field are displayed. A function receives the validation errors and the current state of the field.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};
