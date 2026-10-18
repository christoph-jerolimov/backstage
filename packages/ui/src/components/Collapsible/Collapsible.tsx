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

import { forwardRef, Ref } from 'react';
import {
  Disclosure as RADisclosure,
  Button as RAButton,
  DisclosurePanel as RADisclosurePanel,
} from 'react-aria-components';
import type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsiblePanelProps,
} from './types';
import { useDefinition } from '../../hooks/useDefinition';
import {
  CollapsibleDefinition,
  CollapsibleTriggerDefinition,
  CollapsiblePanelDefinition,
} from './definition';

/**
 * A minimal container that shows or hides its panel when its trigger is activated.
 *
 * @remarks
 * Unlike {@link Accordion}, a Collapsible has no heading, background, or
 * padding of its own. Use it to tuck away secondary content behind any
 * trigger, for example a "Show more" link-style button or an icon button.
 *
 * The expanded state can be uncontrolled with `defaultExpanded` or controlled
 * with `isExpanded` and `onExpandedChange`.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Collapsible>
 *   <CollapsibleTrigger>Show details</CollapsibleTrigger>
 *   <CollapsiblePanel>Additional details go here.</CollapsiblePanel>
 * </Collapsible>
 * ```
 *
 * @example
 * Using a Backstage UI Button as the trigger:
 * ```tsx
 * <Collapsible>
 *   <Button slot="trigger" variant="secondary">Advanced options</Button>
 *   <CollapsiblePanel>...</CollapsiblePanel>
 * </Collapsible>
 * ```
 *
 * @public
 */
export const Collapsible = forwardRef(
  (
    props: CollapsibleProps,
    ref: Ref<React.ElementRef<typeof RADisclosure>>,
  ) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      CollapsibleDefinition,
      props,
    );
    const { classes, children } = ownProps;

    return (
      <RADisclosure
        ref={ref}
        className={classes.root}
        {...dataAttributes}
        {...restProps}
      >
        {children}
      </RADisclosure>
    );
  },
);

Collapsible.displayName = 'Collapsible';

/**
 * The button that toggles the visibility of a {@link CollapsiblePanel}.
 *
 * @remarks
 * Renders an unstyled, accessible button that is wired to its parent
 * {@link Collapsible}. Any Backstage UI button, such as `Button` or
 * `ButtonIcon`, can be used instead by passing `slot="trigger"`.
 *
 * @public
 */
export const CollapsibleTrigger = forwardRef(
  (props: CollapsibleTriggerProps, ref: Ref<HTMLButtonElement>) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      CollapsibleTriggerDefinition,
      props,
    );
    const { classes, children } = ownProps;

    return (
      <RAButton
        ref={ref}
        slot="trigger"
        className={classes.root}
        {...dataAttributes}
        {...restProps}
      >
        {children}
      </RAButton>
    );
  },
);

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

/**
 * The content of a {@link Collapsible} that is shown when it is expanded.
 *
 * @public
 */
export const CollapsiblePanel = forwardRef(
  (
    props: CollapsiblePanelProps,
    ref: Ref<React.ElementRef<typeof RADisclosurePanel>>,
  ) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      CollapsiblePanelDefinition,
      props,
    );
    const { classes } = ownProps;

    return (
      <RADisclosurePanel
        ref={ref}
        className={classes.root}
        {...dataAttributes}
        {...restProps}
      />
    );
  },
);

CollapsiblePanel.displayName = 'CollapsiblePanel';
