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

import { InfoCard, useSidebarPinState } from '@backstage/core-components';
import {
  appThemeApiRef,
  configApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { List } from '@material-ui/core';
import React from 'react';
import { UserSettingsPinToggle } from './UserSettingsPinToggle';
import { UserSettingsThemeToggle } from './UserSettingsThemeToggle';
import { UserSettingsThemeSelect } from './UserSettingsThemeSelect';
import { UserSettingsThemeRadioGroup } from './UserSettingsThemeRadioGroup';

/** @public */
export enum UserSettingsThemeSelectionType {
  Default = 'Default',
  Toggle = 'Toggle',
  Select = 'Select',
  RadioGroup = 'RadioGroup',
}

/** @public */
export const UserSettingsAppearanceCard = () => {
  const appThemeApi = useApi(appThemeApiRef);
  const themes = appThemeApi.getInstalledThemes();
  const config = useApi(configApiRef);
  const themeSelectionType =
    config.getOptional<UserSettingsThemeSelectionType>(
      'userSettings.theme.selectionType',
    ) || UserSettingsThemeSelectionType.Default;

  let ThemeComponent: React.FC<{}>;
  switch (themeSelectionType) {
    case UserSettingsThemeSelectionType.Toggle:
      ThemeComponent = UserSettingsThemeToggle;
      break;
    case UserSettingsThemeSelectionType.Select:
      ThemeComponent = UserSettingsThemeSelect;
      break;
    case UserSettingsThemeSelectionType.RadioGroup:
      ThemeComponent = UserSettingsThemeRadioGroup;
      break;
    case UserSettingsThemeSelectionType.Default:
    default:
      ThemeComponent =
        themes.length > 2 ? UserSettingsThemeSelect : UserSettingsThemeToggle;
  }

  const { isMobile } = useSidebarPinState();

  return (
    <InfoCard title="Appearance" variant="gridItem">
      <List dense>
        <ThemeComponent />
        {!isMobile && <UserSettingsPinToggle />}
      </List>
    </InfoCard>
  );
};
