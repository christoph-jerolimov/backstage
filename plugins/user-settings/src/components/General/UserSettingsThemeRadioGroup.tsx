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

import React, { cloneElement } from 'react';
import useObservable from 'react-use/lib/useObservable';
import AutoIcon from '@material-ui/icons/BrightnessAuto';
import {
  Box,
  FormControlLabel,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';

type ThemeIconProps = {
  icon: JSX.Element | undefined;
  selected: boolean | undefined;
};

const ThemeIcon = ({ icon, selected }: ThemeIconProps) =>
  icon
    ? cloneElement(icon, {
        color: selected ? 'primary' : undefined,
      })
    : null;

const useStyles = makeStyles(theme => ({
  listItemSecondaryAction: {
    position: 'relative',
    transform: 'unset',
    top: 'auto',
    right: 'auto',
    paddingLeft: 16,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
    },
  },
}));

/** @public */
export const UserSettingsThemeRadioGroup = () => {
  const classes = useStyles();
  const appThemeApi = useApi(appThemeApiRef);
  const themeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );

  const themes = appThemeApi.getInstalledThemes();

  const handleSetTheme = (newThemeId: string | undefined) => {
    if (themes.some(t => t.id === newThemeId)) {
      appThemeApi.setActiveThemeId(newThemeId);
    } else {
      appThemeApi.setActiveThemeId(undefined);
    }
  };

  return (
    <ListItem>
      <ListItemText primary="Theme" secondary="Change the theme mode" />
      <ListItemSecondaryAction className={classes.listItemSecondaryAction}>
        <RadioGroup
          value={themeId ?? 'auto'}
          onChange={(_event, newThemeId) => handleSetTheme(newThemeId)}
        >
          <FormControlLabel
            value="auto"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center">
                <AutoIcon
                  color={themeId === undefined ? 'primary' : undefined}
                />
                &nbsp;Auto
              </Box>
            }
          />
          {themes.map(theme => (
            <FormControlLabel
              key={theme.id}
              value={theme.id}
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center">
                  <ThemeIcon
                    icon={theme.icon}
                    selected={theme.id === themeId}
                  />
                  &nbsp;{theme.title}
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
