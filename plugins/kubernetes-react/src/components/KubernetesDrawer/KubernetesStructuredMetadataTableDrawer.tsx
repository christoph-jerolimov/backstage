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

import { ReactNode, useContext, useState } from 'react';
import {
  Button,
  ButtonLink,
  Dialog,
  DialogBody,
  DialogHeader,
  Switch,
  Text,
} from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import type { V1ObjectMeta } from '@kubernetes/client-node';
import {
  StructuredMetadataTable,
  WarningPanel,
} from '@backstage/core-components';
import { ClusterContext } from '../../hooks';
import { ClusterAttributes } from '@backstage/plugin-kubernetes-common';
import { ManifestYaml } from './ManifestYaml';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesClusterLinkFormatterApiRef } from '../../api';
import useAsync from 'react-use/esm/useAsync';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../translation';
import styles from './KubernetesDrawer.module.css';

/**
 *
 *
 * @public
 */
export type LinkErrorPanelProps = {
  cluster: ClusterAttributes;
  errorMessage?: string;
  children?: ReactNode;
};

/**
 *
 *
 * @public
 */
export const LinkErrorPanel = ({
  cluster,
  errorMessage,
}: LinkErrorPanelProps) => {
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  return (
    <WarningPanel
      title={t('linkErrorPanel.title')}
      message={t('linkErrorPanel.message', {
        clusterName: cluster.name,
        dashboardApp: cluster.dashboardApp || 'standard',
      })}
    >
      {errorMessage && (
        <Text as="p" variant="body-small">
          {t('linkErrorPanel.errorsLabel')} {errorMessage}
        </Text>
      )}
    </WarningPanel>
  );
};

/**
 *
 *
 * @public
 */
export interface KubernetesDrawerable {
  metadata?: V1ObjectMeta;
}

interface KubernetesStructuredMetadataTableDrawerContentProps<
  T extends KubernetesDrawerable,
> {
  object: T;
  renderObject: (obj: T) => object;
  kind: string;
}

function replaceNullsWithUndefined(someObj: any) {
  const replacer = (_: any, value: any) =>
    String(value) === 'null' || String(value) === 'undefined'
      ? undefined
      : value;

  return JSON.parse(JSON.stringify(someObj, replacer));
}

const KubernetesStructuredMetadataTableDrawerContent = <
  T extends KubernetesDrawerable,
>({
  object,
  renderObject,
  kind,
}: KubernetesStructuredMetadataTableDrawerContentProps<T>) => {
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  const [isYaml, setIsYaml] = useState<boolean>(false);

  const formatter = useApi(kubernetesClusterLinkFormatterApiRef);
  const cluster = useContext(ClusterContext);
  const { value: clusterLink, error } = useAsync(
    async () =>
      formatter.formatClusterLink({
        dashboardUrl: cluster.dashboardUrl,
        dashboardApp: cluster.dashboardApp,
        dashboardParameters: cluster.dashboardParameters,
        object,
        kind,
      }),
    [cluster, object, kind, formatter],
  );

  return (
    <>
      <DialogHeader>
        {object.metadata?.name ?? t('kubernetesDrawer.unknownName')}
      </DialogHeader>
      <DialogBody>
        <div className={styles.content}>
          <Text as="p" variant="body-medium" color="secondary">
            {kind}
          </Text>
          <Switch
            label={t('kubernetesDrawer.yaml')}
            name={t('kubernetesDrawer.yaml')}
            isSelected={isYaml}
            onChange={setIsYaml}
          />
          {error && (
            <LinkErrorPanel
              cluster={cluster}
              errorMessage={error.message || error.toString()}
            />
          )}
          {clusterLink && (
            <div>
              <ButtonLink
                variant="secondary"
                size="small"
                href={clusterLink}
                iconEnd={<RiExternalLinkLine />}
              >
                Open Kubernetes Dashboard
              </ButtonLink>
            </div>
          )}
          {isYaml && <ManifestYaml object={object} />}
          {!isYaml && (
            <StructuredMetadataTable
              metadata={renderObject(replaceNullsWithUndefined(object))}
              options={{ nestedValuesAsYaml: true }}
            />
          )}
        </div>
      </DialogBody>
    </>
  );
};

/**
 *
 * @public
 */
export interface KubernetesStructuredMetadataTableDrawerProps<
  T extends KubernetesDrawerable,
> {
  object: T;
  renderObject: (obj: T) => object;
  buttonVariant?: 'h5' | 'subtitle2';
  kind: string;
  expanded?: boolean;
  children?: ReactNode;
}

/**
 *
 * @public
 */
export const KubernetesStructuredMetadataTableDrawer = <
  T extends KubernetesDrawerable,
>({
  object,
  renderObject,
  kind,
  buttonVariant = 'subtitle2',
  expanded = false,
  children,
}: KubernetesStructuredMetadataTableDrawerProps<T>) => {
  const [isOpen, setIsOpen] = useState(expanded);

  return (
    <>
      <Button
        variant="tertiary"
        className={styles.trigger}
        onPress={() => setIsOpen(true)}
      >
        {children === undefined ? (
          <Text
            as="span"
            variant={buttonVariant === 'h5' ? 'title-small' : 'body-medium'}
            weight={buttonVariant === 'h5' ? 'regular' : 'bold'}
          >
            {object.metadata?.name ?? 'unknown object'}
          </Text>
        ) : (
          children
        )}
      </Button>
      <Dialog
        className={styles.drawer}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        {isOpen && (
          <KubernetesStructuredMetadataTableDrawerContent
            kind={kind}
            object={object}
            renderObject={renderObject}
          />
        )}
      </Dialog>
    </>
  );
};
