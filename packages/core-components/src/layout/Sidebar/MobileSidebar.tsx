/*
 * Copyright 2020 The Backstage Authors
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

import { useElementFilter } from '@backstage/core-plugin-api';
import { Drawer, DrawerBody, DrawerHeader } from '@backstage/ui';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import { Theme, makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import { orderBy } from 'lodash';
import {
  useEffect,
  useState,
  useContext,
  ReactNode,
  ReactElement,
  createElement,
} from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarOpenStateProvider } from './SidebarOpenStateContext';
import { SidebarGroup } from './SidebarGroup';
import { SidebarConfigContext, SidebarConfig } from './config';
import { MobileSidebarContext } from './MobileSidebarContext';

/**
 * Props of MobileSidebar
 *
 * @public
 */
export type MobileSidebarProps = {
  children?: ReactNode;
};

/**
 * @internal
 */
type OverlayMenuProps = {
  label?: string;
  onClose: () => void;
  open: boolean;
  children?: ReactNode;
};

const useStyles = makeStyles<Theme, { sidebarConfig: SidebarConfig }>(
  theme => ({
    root: {
      position: 'fixed',
      backgroundColor: theme.palette.navigation.background,
      color: theme.palette.navigation.color,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: theme.zIndex.snackbar,
      // SidebarDivider color
      borderTop: '1px solid #383838',
      '@media print': {
        display: 'none',
      },
    },

    // The overlay menu keeps the sidebar colors and leaves room for the
    // bottom navigation below it.
    overlay: props => ({
      '--bui-fg-primary': theme.palette.navigation.color,
      '--bui-fg-secondary': theme.palette.navigation.color,
      backgroundColor: theme.palette.navigation.background,
      color: theme.palette.navigation.color,
      marginBottom: `${props.sidebarConfig.mobileSidebarHeight}px`,
      '& [data-bg]': {
        backgroundColor: 'transparent',
      },
    }),

    overlayBody: {
      padding: 0,
    },
  }),
);

const sortSidebarGroupsForPriority = (children: ReactElement[]) =>
  orderBy(
    children,
    ({ props: { priority } }) => (Number.isInteger(priority) ? priority : -1),
    'desc',
  );

const sidebarGroupType = createElement(SidebarGroup).type;

const OverlayMenu = ({
  children,
  label = 'Menu',
  open,
  onClose,
}: OverlayMenuProps) => {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const classes = useStyles({ sidebarConfig });

  return (
    <Drawer
      placement="bottom"
      height={`calc(100% - ${sidebarConfig.mobileSidebarHeight}px)`}
      className={classes.overlay}
      isOpen={open}
      onOpenChange={isOpen => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DrawerHeader>{label}</DrawerHeader>
      <DrawerBody className={classes.overlayBody}>
        <nav>{children}</nav>
      </DrawerBody>
    </Drawer>
  );
};

/**
 * A navigation component for mobile screens, which sticks to the bottom.
 *
 * @remarks
 * It alternates the normal sidebar by grouping the `SidebarItems` based on provided `SidebarGroup`s
 * either rendering them as a link or an overlay menu.
 * If no `SidebarGroup`s are provided the sidebar content is wrapped in an default overlay menu.
 *
 * @public
 */
export const MobileSidebar = (props: MobileSidebarProps) => {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const { children } = props;
  const classes = useStyles({ sidebarConfig });
  const location = useLocation();
  const [selectedMenuItemIndex, setSelectedMenuItemIndex] =
    useState<number>(-1);

  useEffect(() => {
    setSelectedMenuItemIndex(-1);
  }, [location.pathname]);

  // Filter children for SidebarGroups
  //
  // Directly comparing child.type with SidebarSubmenu will not work with in
  // combination with react-hot-loader
  //
  // https://github.com/gaearon/react-hot-loader/issues/304#issuecomment-456569720
  let sidebarGroups = useElementFilter(children, elements =>
    elements.getElements().filter(child => child.type === sidebarGroupType),
  );

  if (!children) {
    // If Sidebar has no children the MobileSidebar won't be rendered
    return null;
  } else if (!sidebarGroups.length) {
    // If Sidebar has no SidebarGroup as a children a default
    // SidebarGroup with the complete Sidebar content will be created
    sidebarGroups.push(
      <SidebarGroup key="default_menu" icon={<MenuIcon />}>
        {children}
      </SidebarGroup>,
    );
  } else {
    // Sort SidebarGroups for the given Priority
    sidebarGroups = sortSidebarGroupsForPriority(sidebarGroups);
  }

  const shouldShowGroupChildren =
    selectedMenuItemIndex >= 0 &&
    !sidebarGroups[selectedMenuItemIndex].props.to;

  return (
    <SidebarOpenStateProvider value={{ isOpen: true, setOpen: () => {} }}>
      <MobileSidebarContext.Provider
        value={{ selectedMenuItemIndex, setSelectedMenuItemIndex }}
      >
        <OverlayMenu
          label={
            sidebarGroups[selectedMenuItemIndex] &&
            (sidebarGroups[selectedMenuItemIndex]!.props.label as string)
          }
          open={shouldShowGroupChildren}
          onClose={() => setSelectedMenuItemIndex(-1)}
        >
          {sidebarGroups[selectedMenuItemIndex] &&
            (sidebarGroups[selectedMenuItemIndex].props.children as ReactNode)}
        </OverlayMenu>
        <BottomNavigation
          className={classes.root}
          data-testid="mobile-sidebar-root"
          component="nav"
        >
          {sidebarGroups}
        </BottomNavigation>
      </MobileSidebarContext.Provider>
    </SidebarOpenStateProvider>
  );
};
