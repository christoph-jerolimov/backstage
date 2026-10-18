/*
 * Copyright 2021 The Backstage Authors
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

import { ReactNode, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Theme, useTheme } from '@material-ui/core/styles';
import FilterListIcon from '@material-ui/icons/FilterList';
import { Drawer, DrawerBody, DrawerHeader } from '@backstage/ui';
import { catalogReactTranslationRef } from '../../translation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * Material UI renders menus, popovers and dialogs in portals outside of the
 * drawer. Interacting with them must not dismiss the drawer.
 */
const isOutsideMaterialUiPopup = (element: Element) =>
  !element.closest('[role="presentation"]');

/** @public */
export const Filters = (props: {
  children: ReactNode;
  options?: {
    drawerBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    drawerAnchor?: 'left' | 'right' | 'top' | 'bottom';
  };
}) => {
  const isScreenSmallerThanBreakpoint = useMediaQuery(
    (theme: Theme) =>
      theme.breakpoints.down(props.options?.drawerBreakpoint ?? 'md'),
    { noSsr: true },
  );
  const theme = useTheme();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);
  const { t } = useTranslationRef(catalogReactTranslationRef);

  return isScreenSmallerThanBreakpoint ? (
    <>
      <Button
        style={{ marginTop: theme.spacing(1), marginLeft: theme.spacing(1) }}
        onClick={() => setFilterDrawerOpen(true)}
        startIcon={<FilterListIcon />}
      >
        {t('catalogFilter.buttonTitle')}
      </Button>
      <Drawer
        isOpen={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        placement={props.options?.drawerAnchor ?? 'left'}
        isNonModal
        shouldCloseOnInteractOutside={isOutsideMaterialUiPopup}
      >
        <DrawerHeader>{t('catalogFilter.title')}</DrawerHeader>
        <DrawerBody>{props.children}</DrawerBody>
      </Drawer>
    </>
  ) : (
    <Grid item lg={2}>
      {props.children}
    </Grid>
  );
};

/** @public */
export const Content = (props: { children: ReactNode }) => {
  return (
    <Grid item xs={12} lg={10}>
      {props.children}
    </Grid>
  );
};

/** @public */
export const CatalogFilterLayout = (props: { children: ReactNode }) => {
  return (
    <Grid container style={{ position: 'relative' }}>
      {props.children}
    </Grid>
  );
};

CatalogFilterLayout.Filters = Filters;
CatalogFilterLayout.Content = Content;
