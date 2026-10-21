import {
  classNamePropDefs,
  stylePropDefs,
  type PropDef,
} from '@/utils/propDefs';

export const drawerTriggerPropDefs: Record<string, PropDef> = {
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Trigger element and drawer content.',
  },
  isOpen: {
    type: 'boolean',
    description: 'Whether the overlay is open by default (controlled).',
  },
  defaultOpen: {
    type: 'boolean',
    description: 'Whether the overlay is open by default (uncontrolled).',
  },
  onOpenChange: {
    type: 'enum',
    values: ['(isOpen: boolean) => void'],
    description:
      "Handler that is called when the overlay's open state changes.",
  },
};

export const drawerPropDefs: Record<string, PropDef> = {
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Drawer content (DrawerHeader, DrawerBody, DrawerFooter).',
  },
  placement: {
    type: 'enum',
    values: ['left', 'right', 'top', 'bottom'],
    default: 'right',
    description:
      'The edge of the viewport the drawer slides in from. Left and right drawers take the full viewport height, top and bottom drawers take the full viewport width.',
  },
  width: {
    type: 'enum',
    values: ['number', 'string'],
    default: '400',
    description:
      'Width of a left or right drawer in pixels (number) or CSS units (string). The drawer never grows wider than the viewport.',
  },
  height: {
    type: 'enum',
    values: ['number', 'string'],
    default: 'auto',
    description:
      'Height of a top or bottom drawer in pixels (number) or CSS units (string). The drawer never grows taller than the viewport.',
  },
  isNonModal: {
    type: 'boolean',
    default: 'false',
    description:
      'Keeps the rest of the page interactive while the drawer is open. A non-modal drawer has no backdrop, does not trap focus and does not block scrolling.',
  },
  hideBackdrop: {
    type: 'boolean',
    default: 'false',
    description:
      'Hides the backdrop of a modal drawer. The page behind the drawer stays blocked until it closes.',
  },
  isDismissable: {
    type: 'boolean',
    default: 'true',
    description:
      'Whether the user can close the drawer by interacting outside of it, pressing Escape, or swiping it away. When false, the drawer only closes through its own controls.',
  },
  snapPoints: {
    type: 'enum',
    values: ['Array<number | string>'],
    description:
      'Positions a modal drawer stops at when swiped, as the amount of the drawer that is visible. Numbers are pixels, percentages are relative to the drawer. The drawer opens at the first snap point.',
  },
  swipeDirection: {
    type: 'enum',
    values: ['bottom', 'top', 'vertical', 'left', 'right', 'horizontal'],
    description:
      'The direction a modal drawer can be swiped to dismiss it. Defaults to the direction of its placement.',
  },
  isOpen: {
    type: 'boolean',
    description: 'Whether the overlay is open (controlled mode).',
  },
  defaultOpen: {
    type: 'boolean',
    description: 'Initial open state (uncontrolled mode).',
  },
  onOpenChange: {
    type: 'enum',
    values: ['(isOpen: boolean) => void'],
    description: 'Called when the open state changes.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const drawerHeaderPropDefs: Record<string, PropDef> = {
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Drawer title text.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const drawerBodyPropDefs: Record<string, PropDef> = {
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Main content of the drawer.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};

export const drawerFooterPropDefs: Record<string, PropDef> = {
  children: {
    type: 'enum',
    values: ['ReactNode'],
    description: 'Action buttons or footer content.',
  },
  ...classNamePropDefs,
  ...stylePropDefs,
};
