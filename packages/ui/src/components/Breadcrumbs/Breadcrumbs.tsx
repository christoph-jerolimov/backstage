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

import type { BreadcrumbItem, BreadcrumbsProps } from './types';
import { forwardRef } from 'react';
import { useDefinition } from '../../hooks/useDefinition';
import { BreadcrumbsDefinition } from './definition';
import { Link } from '../Link';
import { Text } from '../Text';
import { MenuTrigger, Menu, MenuItem } from '../Menu';
import { RiArrowRightSLine } from '@remixicon/react';
import {
  Focusable,
  Breadcrumb as RACBreadcrumb,
  Breadcrumbs as RACBreadcrumbs,
  Button as RACButton,
} from 'react-aria-components';
import { useIsTruncated } from '../../hooks/useIsTruncated';
import { Tooltip, TooltipTrigger } from '../Tooltip';

const COLLAPSE_THRESHOLD = 5;
const ROOT_ITEMS = 1;
const LEADING_ITEMS = 1;

type BreadcrumbsClasses = Record<
  keyof typeof BreadcrumbsDefinition.classNames,
  string
>;

/** Separator icon that appears after non-current segments */
function BreadcrumbSeparator(props: { className: string }) {
  return (
    <span aria-hidden="true" className={props.className}>
      <RiArrowRightSLine size={16} />
    </span>
  );
}

/** Wraps children in a tooltip that shows on hover when the label is truncated. */
function BreadcrumbTooltipWrapper(props: {
  showTooltip: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const { showTooltip, label, children } = props;

  return (
    <TooltipTrigger delay={300} isDisabled={!showTooltip}>
      {children}
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}

/** Renders a link in the breadcrumbs trail */
function BreadcrumbLink(props: { item: BreadcrumbItem }) {
  const { item } = props;
  const { ref, truncated } = useIsTruncated<HTMLAnchorElement>();
  return (
    <BreadcrumbTooltipWrapper label={item.label} showTooltip={truncated}>
      <Link
        href={item.href}
        standalone
        variant="body-medium"
        truncate
        ref={ref}
      >
        {item.label}
      </Link>
    </BreadcrumbTooltipWrapper>
  );
}

/**
 * Renders a text in the breadcrumbs trail.
 * If it is truncated, it becomes focusable (requirement for the tooltip to work)
 */
function BreadcrumbText(props: { item: BreadcrumbItem }) {
  const { item } = props;
  const { ref, truncated } = useIsTruncated<HTMLParagraphElement>();

  return (
    <BreadcrumbTooltipWrapper label={item.label} showTooltip={truncated}>
      <Focusable excludeFromTabOrder={!truncated}>
        <Text variant="body-medium" truncate ref={ref}>
          {item.label}
        </Text>
      </Focusable>
    </BreadcrumbTooltipWrapper>
  );
}

/** Renders an ellipsis button that opens a menu with the collapsed breadcrumb items. */
function CollapsedSegment(props: {
  items: BreadcrumbItem[];
  classes: BreadcrumbsClasses;
}) {
  const { items, classes } = props;
  const ariaLabel = 'Show more breadcrumbs';
  return (
    <RACBreadcrumb key="collapsed" className={classes.item}>
      <MenuTrigger>
        <RACButton aria-label={ariaLabel} className={classes.ellipsis}>
          <Text as="span" variant="body-medium">
            …
          </Text>
        </RACButton>
        <Menu>
          {items.map(item => (
            <MenuItem key={item.href} href={item.href}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </MenuTrigger>
      <BreadcrumbSeparator className={classes.separator} />
    </RACBreadcrumb>
  );
}

/** Renders a non-current breadcrumb segment as a link with a trailing separator. */
function AncestorSegment(props: {
  item: BreadcrumbItem;
  classes: BreadcrumbsClasses;
}) {
  const { item, classes } = props;
  return (
    <RACBreadcrumb key={item.href} className={classes.item}>
      <BreadcrumbLink item={item} />
      <BreadcrumbSeparator className={classes.separator} />
    </RACBreadcrumb>
  );
}

/**
 * Renders the current page in the breadcrumbs trail
 * - RAC Breadcrumbs will attach `data-current` to this segment
 * - If it's the only entry (eg. we are on the root page of the Plugin), it will render as a link
 * - Otherwise renders as text
 * - If truncated, will be focusable and show a tooltip
 */
function CurrentSegment(props: {
  item: BreadcrumbItem;
  isSingleItem: boolean;
  classes: BreadcrumbsClasses;
}) {
  const { item, isSingleItem, classes } = props;
  return (
    <RACBreadcrumb key={item.href} className={classes.item}>
      {isSingleItem ? (
        <BreadcrumbLink item={item} />
      ) : (
        <BreadcrumbText item={item} />
      )}
    </RACBreadcrumb>
  );
}

/**
 * Renders a breadcrumb navigation trail from an ordered list of items.
 *
 * - A single item renders as a clickable link (for example the root page of a plugin).
 * - Multiple items render ancestors as links and the last item as plain text.
 * - Long labels truncate and show their full text in a tooltip.
 * - When there are five or more items, the middle items collapse behind an
 *   ellipsis menu, keeping the first and the last two items visible.
 *
 * Breadcrumbs that belong to the plugin header are rendered by
 * {@link PluginHeader} through its `breadcrumbs` prop, so there is no need
 * to place this component inside a header manually.
 *
 * @public
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  (props, ref) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      BreadcrumbsDefinition,
      props,
    );
    const { classes, items } = ownProps;

    if (!items || items.length === 0) return null;

    const isSingleItem = items.length === 1;
    const current = items[items.length - 1];
    const rest = items.slice(0, -1);

    let ancestorItems: React.ReactNode = null;

    if (items.length >= COLLAPSE_THRESHOLD) {
      const root = rest.slice(0, ROOT_ITEMS);
      const leading = rest.slice(-LEADING_ITEMS);
      const collapsed = rest.slice(ROOT_ITEMS, -LEADING_ITEMS);

      ancestorItems = (
        <>
          {root.map(item => (
            <AncestorSegment key={item.href} item={item} classes={classes} />
          ))}
          <CollapsedSegment items={collapsed} classes={classes} />
          {leading.map(item => (
            <AncestorSegment key={item.href} item={item} classes={classes} />
          ))}
        </>
      );
    } else {
      ancestorItems = rest.map(item => (
        <AncestorSegment key={item.href} item={item} classes={classes} />
      ));
    }

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumbs"
        className={classes.root}
        {...dataAttributes}
        {...restProps}
      >
        <RACBreadcrumbs className={classes.list}>
          {ancestorItems}
          <CurrentSegment
            item={current}
            isSingleItem={isSingleItem}
            classes={classes}
          />
        </RACBreadcrumbs>
      </nav>
    );
  },
);
