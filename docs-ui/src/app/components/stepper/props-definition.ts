import {
  classNamePropDefs,
  stylePropDefs,
  type PropDef,
} from '@/utils/propDefs';

export const stepperPropDefs: Record<string, PropDef> = {
  orientation: {
    type: 'enum',
    values: ['horizontal', 'vertical'],
    default: 'horizontal',
    description: 'Whether the steps are laid out in a row or in a column.',
  },
  placement: {
    type: 'enum',
    values: ['aside', 'below'],
    default: 'aside',
    description:
      'Where the text of each step is shown. With aside, the text follows the indicator in reading direction. With below, the text is centered below the indicator. Only applies to the horizontal orientation.',
  },
  selectedKey: {
    type: 'enum',
    values: ['Key', 'null'],
    description: 'The id of the selected step (controlled).',
  },
  defaultSelectedKey: {
    type: 'enum',
    values: ['Key'],
    description:
      'The id of the step that is selected on initial render (uncontrolled). Defaults to the first step.',
  },
  onSelectionChange: {
    type: 'enum',
    values: ['(key: Key) => void'],
    description:
      'Called when the selected step changes, either because the user activated a step or because a previous or next button was pressed.',
  },
  lastCompletedStep: {
    type: 'enum',
    values: ['Key', 'null'],
    description:
      'The id of the last completed step (controlled). Steps up to and including this one are marked as completed, and the step directly after it is the furthest step the user can select.',
  },
  defaultLastCompletedStep: {
    type: 'enum',
    values: ['Key'],
    description: 'The id of the last completed step on initial render.',
  },
  onLastCompletedStepChange: {
    type: 'enum',
    values: ['(key: Key | null) => void'],
    description:
      'Called when the last completed step changes. The last completed step advances automatically whenever a later step gets selected.',
  },
  isReadOnly: {
    type: 'boolean',
    default: 'false',
    description:
      'Whether the user can select steps directly from the step list. When read-only, navigation is only possible with the previous and next buttons or programmatically.',
  },
  isDisabled: {
    type: 'boolean',
    default: 'false',
    description: 'Whether the whole stepper is disabled.',
  },
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description:
      'A StepList, one StepPanel per step and the navigation buttons.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const stepListPropDefs: Record<string, PropDef> = {
  'aria-label': {
    type: 'string',
    description: 'A label that describes the flow, for assistive technology.',
  },
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Step components, in order.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const stepPropDefs: Record<string, PropDef> = {
  id: {
    type: 'enum',
    values: ['Key'],
    required: true,
    description:
      'The unique id of the step. Used to match the step with its StepPanel.',
  },
  title: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'The title of the step.',
  },
  description: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Optional secondary text displayed below the title.',
  },
  indicator: {
    type: 'enum',
    values: ['ReactNode'],
    description:
      'Custom content for the step indicator, for example a status icon. Replaces the step number and the check mark of completed steps.',
  },
  isDisabled: {
    type: 'boolean',
    default: 'false',
    description: 'Whether this step can be selected by the user.',
  },
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description:
      'Custom step content. When provided, title and description are ignored.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const stepPanelPropDefs: Record<string, PropDef> = {
  id: {
    type: 'enum',
    values: ['Key'],
    required: true,
    description: 'The id of the step this panel belongs to.',
  },
  shouldForceMount: {
    type: 'boolean',
    default: 'false',
    description:
      'Whether to keep the panel mounted while another step is selected. Useful to preserve form state when the user navigates back and forth.',
  },
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'The content of the step.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const stepperPreviousButtonPropDefs: Record<string, PropDef> = {
  children: {
    type: 'enum',
    values: ['ReactNode'],
    default: "'Back'",
    description: 'The button label.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const stepperNextButtonPropDefs: Record<string, PropDef> = {
  children: {
    type: 'enum',
    values: ['ReactNode'],
    default: "'Next'",
    description: 'The button label.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const useStepperPropDefs: Record<string, PropDef> = {
  stepKeys: {
    type: 'enum',
    values: ['Key[]'],
    description: 'The ids of all steps, in order.',
  },
  selectedKey: {
    type: 'enum',
    values: ['Key', 'null'],
    description: 'The id of the selected step.',
  },
  selectedIndex: {
    type: 'number',
    description:
      'The index of the selected step, or -1 when there are no steps.',
  },
  lastCompletedStep: {
    type: 'enum',
    values: ['Key', 'null'],
    description: 'The id of the last completed step.',
  },
  isFirstStep: {
    type: 'boolean',
    description: 'Whether the first step is selected.',
  },
  isLastStep: {
    type: 'boolean',
    description: 'Whether the last step is selected.',
  },
  isReadOnly: {
    type: 'boolean',
    description: 'Whether the stepper is read-only.',
  },
  isDisabled: {
    type: 'boolean',
    description: 'Whether the stepper is disabled.',
  },
  setSelectedKey: {
    type: 'enum',
    values: ['(key: Key) => void'],
    description:
      'Selects the given step. Steps before it are marked as completed.',
  },
  setLastCompletedStep: {
    type: 'enum',
    values: ['(key: Key | null) => void'],
    description:
      'Marks the given step, and every step before it, as completed. Pass null to reset all steps.',
  },
  selectNextStep: {
    type: 'enum',
    values: ['() => void'],
    description: 'Selects the next step, if any.',
  },
  selectPreviousStep: {
    type: 'enum',
    values: ['() => void'],
    description: 'Selects the previous step, if any.',
  },
  isStepCompleted: {
    type: 'enum',
    values: ['(key: Key) => boolean'],
    description: 'Whether the given step is completed.',
  },
  isStepSelectable: {
    type: 'enum',
    values: ['(key: Key) => boolean'],
    description:
      'Whether the user can select the given step from the step list.',
  },
};
