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

import { forwardRef, useContext, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import {
  FocusScope,
  Overlay,
  mergeProps,
  useObjectRef,
  useOverlay,
} from 'react-aria';
import {
  Dialog as RADialog,
  DialogTrigger as RADialogTrigger,
  Modal,
  ModalOverlay,
  OverlayTriggerStateContext,
  Heading,
} from 'react-aria-components';
import { useOverlayTriggerState } from 'react-stately';
import type {
  DrawerTriggerProps,
  DrawerHeaderProps,
  DrawerProps,
  DrawerBodyProps,
  DrawerFooterProps,
} from './types';
import { RiCloseLine } from '@remixicon/react';
import { Button } from '../Button';
import { useDefinition } from '../../hooks/useDefinition';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import {
  DrawerDefinition,
  DrawerHeaderDefinition,
  DrawerBodyDefinition,
  DrawerFooterDefinition,
} from './definition';
import { Box } from '../Box';
import { BgReset } from '../../hooks/useBg';
import { Flex } from '../Flex';

/**
 * A wrapper that connects a trigger element to a Drawer, controlling its open and close state.
 *
 * @public
 */
export const DrawerTrigger = (props: DrawerTriggerProps) => {
  return <RADialogTrigger {...props} />;
};

type DrawerPhase = 'entering' | 'open' | 'exiting' | 'closed';

/**
 * Keeps a non-modal drawer mounted while its CSS enter and exit animations
 * play, mirroring the `data-entering` and `data-exiting` states that React
 * Aria applies to modal overlays.
 */
function useDrawerAnimation(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
) {
  const [phase, setPhase] = useState<DrawerPhase>(
    isOpen ? 'entering' : 'closed',
  );

  useIsomorphicLayoutEffect(() => {
    setPhase(current => {
      if (isOpen) {
        return current === 'open' ? 'open' : 'entering';
      }
      return current === 'closed' ? 'closed' : 'exiting';
    });
  }, [isOpen]);

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') {
      return undefined;
    }

    let cancelled = false;
    const settle = () => {
      if (!cancelled) {
        setPhase(current => {
          if (current !== phase) {
            return current;
          }
          return phase === 'entering' ? 'open' : 'closed';
        });
      }
    };

    const animations = ref.current?.getAnimations?.({ subtree: true }) ?? [];
    if (animations.length === 0) {
      settle();
    } else {
      Promise.allSettled(animations.map(animation => animation.finished)).then(
        settle,
      );
    }

    return () => {
      cancelled = true;
    };
  }, [phase, ref]);

  return {
    isMounted: phase !== 'closed',
    isEntering: phase === 'entering',
    isExiting: phase === 'exiting',
  };
}

const toCssSize = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

/**
 * A panel that slides in from an edge of the viewport. A modal drawer blocks the page behind it until it closes, while a non-modal drawer leaves the page interactive.
 *
 * @remarks
 * Use `placement` to pick the edge the drawer slides in from. A left or right
 * drawer takes the full viewport height and is sized with `width`; a top or
 * bottom drawer takes the full viewport width and is sized with `height`.
 *
 * By default the drawer is modal: it shows a backdrop, traps focus, and closes
 * when the user clicks outside of it or presses Escape. Set `hideBackdrop` to
 * keep the drawer modal without a visible backdrop. Set `isNonModal` to keep
 * the rest of the page interactive while the drawer is open, and
 * `isDismissable={false}` to only close the drawer through its own controls.
 *
 * @example
 * Basic usage with DrawerTrigger:
 * ```tsx
 * <DrawerTrigger>
 *   <Button>Open Drawer</Button>
 *   <Drawer>
 *     <DrawerHeader>Title</DrawerHeader>
 *     <DrawerBody>Content</DrawerBody>
 *     <DrawerFooter>
 *       <Button slot="close">Close</Button>
 *     </DrawerFooter>
 *   </Drawer>
 * </DrawerTrigger>
 * ```
 *
 * @example
 * A persistent side panel that keeps the page interactive:
 * ```tsx
 * <Drawer isOpen={isOpen} onOpenChange={setIsOpen} isNonModal isDismissable={false}>
 *   <DrawerHeader>Details</DrawerHeader>
 *   <DrawerBody>Content</DrawerBody>
 * </Drawer>
 * ```
 *
 * @public
 */
export const Drawer = forwardRef<React.ElementRef<typeof Modal>, DrawerProps>(
  (props, ref) => {
    const { ownProps, restProps, dataAttributes } = useDefinition(
      DrawerDefinition,
      props,
      { classNameTarget: 'container' },
    );
    const {
      classes,
      children,
      width,
      height,
      isNonModal,
      isDismissable,
      style,
    } = ownProps;

    const containerStyle = {
      ['--bui-drawer-width' as keyof React.CSSProperties]:
        toCssSize(width) || '400px',
      ...(height
        ? {
            ['--bui-drawer-height' as keyof React.CSSProperties]:
              toCssSize(height),
          }
        : {}),
      ...style,
    };

    const content = (
      <RADialog className={classes.inner}>
        <BgReset>
          <Box bg="neutral" className={classes.content}>
            {children}
          </Box>
        </BgReset>
      </RADialog>
    );

    if (isNonModal) {
      return (
        <NonModalDrawer
          {...restProps}
          ref={ref}
          classes={classes}
          dataAttributes={dataAttributes}
          isDismissable={isDismissable}
          style={containerStyle}
        >
          {content}
        </NonModalDrawer>
      );
    }

    return (
      <ModalOverlay
        className={classes.root}
        isDismissable={isDismissable}
        isKeyboardDismissDisabled={false}
        {...dataAttributes}
        {...restProps}
      >
        <Modal ref={ref} className={classes.container} style={containerStyle}>
          {content}
        </Modal>
      </ModalOverlay>
    );
  },
);

Drawer.displayName = 'Drawer';

type NonModalDrawerProps = Omit<DrawerProps, 'children' | 'className'> & {
  classes: Record<'root' | 'container' | 'inner' | 'content', string>;
  dataAttributes: Record<string, string | undefined>;
  children: React.ReactNode;
};

/**
 * Renders a drawer that does not block the rest of the page. React Aria's
 * Modal always traps focus and hides the page from assistive technology, so
 * the non-modal variant is composed from the lower level overlay primitives.
 */
const NonModalDrawer = forwardRef<HTMLDivElement, NonModalDrawerProps>(
  (props, forwardedRef) => {
    const {
      classes,
      dataAttributes,
      children,
      style,
      isOpen,
      defaultOpen,
      onOpenChange,
      isDismissable,
      isKeyboardDismissDisabled,
      shouldCloseOnInteractOutside,
      UNSTABLE_portalContainer,
      // Modal-only props that have no equivalent for a non-modal drawer.
      isEntering: _isEntering,
      isExiting: _isExiting,
      onEnter: _onEnter,
      onExit: _onExit,
      UNSTABLE_deferUntilEntered: _deferUntilEntered,
      slot: _slot,
      ...domProps
    } = props;

    const contextState = useContext(OverlayTriggerStateContext);
    const localState = useOverlayTriggerState({
      isOpen,
      defaultOpen,
      onOpenChange,
    });
    const state =
      isOpen != null || defaultOpen != null || !contextState
        ? localState
        : contextState;

    const ref = useObjectRef(forwardedRef);
    const rootRef = useObjectRef<HTMLDivElement>();
    const { isMounted, isEntering, isExiting } = useDrawerAnimation(
      rootRef,
      state.isOpen,
    );

    const { overlayProps } = useOverlay(
      {
        isOpen: state.isOpen,
        onClose: state.close,
        isDismissable,
        isKeyboardDismissDisabled,
        shouldCloseOnInteractOutside,
      },
      ref,
    );

    if (!isMounted) {
      return null;
    }

    return (
      <Overlay
        portalContainer={UNSTABLE_portalContainer}
        isExiting={isExiting}
        disableFocusManagement
      >
        <div
          ref={rootRef}
          className={classes.root}
          {...dataAttributes}
          data-entering={isEntering || undefined}
          data-exiting={isExiting || undefined}
        >
          <FocusScope restoreFocus>
            <div
              {...mergeProps(domProps, overlayProps)}
              ref={ref}
              className={classes.container}
              style={style}
            >
              <OverlayTriggerStateContext.Provider value={state}>
                {children}
              </OverlayTriggerStateContext.Provider>
            </div>
          </FocusScope>
        </div>
      </Overlay>
    );
  },
);

NonModalDrawer.displayName = 'NonModalDrawer';

/**
 * The header section of a Drawer, containing the title and a close button.
 *
 * @public
 */
export const DrawerHeader = forwardRef<
  React.ElementRef<'div'>,
  DrawerHeaderProps
>((props, ref) => {
  const { ownProps, restProps } = useDefinition(DrawerHeaderDefinition, props);
  const { classes, children } = ownProps;

  return (
    <Flex ref={ref} className={classes.root} {...restProps}>
      <Heading slot="title" className={classes.title}>
        {children}
      </Heading>
      <Button name="close" aria-label="Close" variant="tertiary" slot="close">
        <RiCloseLine />
      </Button>
    </Flex>
  );
});
DrawerHeader.displayName = 'DrawerHeader';

/**
 * The main scrollable content area of a Drawer.
 *
 * @public
 */
export const DrawerBody = forwardRef<React.ElementRef<'div'>, DrawerBodyProps>(
  (props, ref) => {
    const { ownProps, restProps } = useDefinition(DrawerBodyDefinition, props);
    const { classes, children } = ownProps;

    return (
      <div className={classes.root} ref={ref} {...restProps}>
        {children}
      </div>
    );
  },
);

DrawerBody.displayName = 'DrawerBody';

/**
 * The footer section of a Drawer, typically used to place action buttons.
 *
 * @public
 */
export const DrawerFooter = forwardRef<
  React.ElementRef<'div'>,
  DrawerFooterProps
>((props, ref) => {
  const { ownProps, restProps } = useDefinition(DrawerFooterDefinition, props);
  const { classes, children } = ownProps;

  return (
    <div ref={ref} className={classes.root} {...restProps}>
      {children}
    </div>
  );
});
DrawerFooter.displayName = 'DrawerFooter';
