/*
 * Copyright 2023 The Backstage Authors
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

import type { IObjectMeta } from '@kubernetes-models/apimachinery/apis/meta/v1/ObjectMeta';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from '@material-ui/core/styles';
import { Drawer, DrawerBody, DrawerHeader } from '@backstage/ui';
import { ManifestYaml } from './ManifestYaml';
import { isOutsideMaterialUiPopup } from './isOutsideMaterialUiPopup';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../translation';

const useDrawerContentStyles = makeStyles((_theme: Theme) =>
  createStyles({
    content: {
      height: '80%',
    },
  }),
);

/**
 * The type of object that can be represented by the Drawer
 *
 * @public
 */
export interface KubernetesObject {
  kind: string;
  metadata?: IObjectMeta;
}

interface KubernetesDrawerContentProps {
  kubernetesObject: KubernetesObject;
  header?: ReactNode;
  children?: ReactNode;
}

const KubernetesDrawerContent = ({
  children,
  header,
  kubernetesObject,
}: KubernetesDrawerContentProps) => {
  const classes = useDrawerContentStyles();
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  const [isYaml, setIsYaml] = useState<boolean>(false);

  return (
    <>
      <DrawerHeader>{kubernetesObject.metadata?.name}</DrawerHeader>
      <DrawerBody>
        {header}
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={isYaml}
                onChange={event => {
                  setIsYaml(event.target.checked);
                }}
                name={t('kubernetesDrawer.yaml')}
              />
            }
            label={t('kubernetesDrawer.yaml')}
          />
        </div>
        <div className={classes.content}>
          {isYaml && <ManifestYaml object={kubernetesObject} />}
          {!isYaml && children}
        </div>
      </DrawerBody>
    </>
  );
};

/**
 * Props of KubernetesDrawer
 *
 * @public
 */
export interface KubernetesDrawerProps {
  open?: boolean;
  kubernetesObject: KubernetesObject;
  label: ReactNode;
  drawerContentsHeader?: ReactNode;
  children?: ReactNode;
}

const DrawerButton = withStyles({
  root: {
    padding: '6px 5px',
  },
  label: {
    textTransform: 'none',
  },
})(Button);

/**
 * Button/Drawer component for Kubernetes Objects
 *
 * @public
 */
export const KubernetesDrawer = ({
  open,
  label,
  drawerContentsHeader,
  kubernetesObject,
  children,
}: KubernetesDrawerProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(open ?? false);

  return (
    <>
      <DrawerButton onClick={() => setIsOpen(true)}>{label}</DrawerButton>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width="50%"
        isNonModal
        shouldCloseOnInteractOutside={isOutsideMaterialUiPopup}
        // The drawer is rendered within an accordion, which must not toggle
        // when interacting with the drawer.
        onClick={event => event.stopPropagation()}
      >
        <KubernetesDrawerContent
          header={drawerContentsHeader}
          kubernetesObject={kubernetesObject}
          children={children}
        />
      </Drawer>
    </>
  );
};
