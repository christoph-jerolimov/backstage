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
import {
  Button,
  Dialog,
  DialogBody,
  DialogHeader,
  Switch,
} from '@backstage/ui';
import { ManifestYaml } from './ManifestYaml';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../translation';
import styles from './KubernetesDrawer.module.css';

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
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  const [isYaml, setIsYaml] = useState<boolean>(false);

  return (
    <>
      <DialogHeader>{kubernetesObject.metadata?.name}</DialogHeader>
      <DialogBody>
        <div className={styles.content}>
          {header}
          <Switch
            label={t('kubernetesDrawer.yaml')}
            name={t('kubernetesDrawer.yaml')}
            isSelected={isYaml}
            onChange={setIsYaml}
          />
          {isYaml && <ManifestYaml object={kubernetesObject} />}
          {!isYaml && children}
        </div>
      </DialogBody>
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
      <Button
        variant="tertiary"
        className={styles.trigger}
        onPress={() => setIsOpen(true)}
      >
        {label}
      </Button>
      <Dialog
        className={styles.drawer}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        {isOpen && (
          <KubernetesDrawerContent
            header={drawerContentsHeader}
            kubernetesObject={kubernetesObject}
            children={children}
          />
        )}
      </Dialog>
    </>
  );
};
