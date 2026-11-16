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

import { storageApiRef, useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVert from '@material-ui/icons/MoreVert';
import { SyntheticEvent, useCallback, useMemo, useState } from 'react';
import useObservable from 'react-use/esm/useObservable';
import { scaffolderReactTranslationRef } from '../../../translation';

const STORAGE_BUCKET = 'scaffolder';
const STORAGE_KEY = 'workflowDescriptionLayout';

const layouts = ['hidden', 'above', 'side'] as const;

/**
 * Where the template description is shown in relation to the form.
 */
export type DescriptionLayout = (typeof layouts)[number];

const DEFAULT_LAYOUT: DescriptionLayout = 'above';

function isDescriptionLayout(value: unknown): value is DescriptionLayout {
  return layouts.includes(value as DescriptionLayout);
}

/**
 * Reads and updates the description layout that the user has selected. The
 * selection is kept in the user settings storage, so that it applies to all
 * templates.
 */
export function useDescriptionLayout(): [
  DescriptionLayout,
  (layout: DescriptionLayout) => void,
] {
  const storageApi = useApi(storageApiRef);
  const bucket = useMemo(
    () => storageApi.forBucket(STORAGE_BUCKET),
    [storageApi],
  );
  const observable = useMemo(() => bucket.observe$(STORAGE_KEY), [bucket]);
  const snapshot = useObservable(observable, bucket.snapshot(STORAGE_KEY));

  const setLayout = useCallback(
    (layout: DescriptionLayout) => {
      bucket.set(STORAGE_KEY, layout).catch(() => {});
    },
    [bucket],
  );

  return [
    isDescriptionLayout(snapshot.value) ? snapshot.value : DEFAULT_LAYOUT,
    setLayout,
  ];
}

export function DescriptionLayoutMenu(props: {
  layout: DescriptionLayout;
  onChange: (layout: DescriptionLayout) => void;
}) {
  const { layout, onChange } = props;
  const { t } = useTranslationRef(scaffolderReactTranslationRef);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();

  const labels: Record<DescriptionLayout, string> = {
    hidden: t('workflow.descriptionMenu.hidden'),
    above: t('workflow.descriptionMenu.above'),
    side: t('workflow.descriptionMenu.side'),
  };

  return (
    <>
      <IconButton
        aria-label={t('workflow.descriptionMenu.label')}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        onClick={(event: SyntheticEvent<HTMLButtonElement>) =>
          setAnchorEl(event.currentTarget)
        }
      >
        <MoreVert />
      </IconButton>
      <Menu
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(undefined)}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {layouts.map(option => (
          <MenuItem
            key={option}
            role="menuitemradio"
            aria-checked={option === layout}
            selected={option === layout}
            onClick={() => {
              onChange(option);
              setAnchorEl(undefined);
            }}
          >
            {labels[option]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
