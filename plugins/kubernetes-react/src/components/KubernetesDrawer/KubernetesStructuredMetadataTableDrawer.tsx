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
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { Drawer, DrawerBody, DrawerHeader } from '@backstage/ui';
import type { V1ObjectMeta } from '@kubernetes/client-node';
import { withStyles } from '@material-ui/core/styles';
import {
  LinkButton as BackstageButton,
  StructuredMetadataTable,
  WarningPanel,
} from '@backstage/core-components';
import { ClusterContext } from '../../hooks';
import { ClusterAttributes } from '@backstage/plugin-kubernetes-common';
import { ManifestYaml } from './ManifestYaml';
import { isOutsideMaterialUiPopup } from './isOutsideMaterialUiPopup';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesClusterLinkFormatterApiRef } from '../../api';
import useAsync from 'react-use/esm/useAsync';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../translation';

const useDrawerContentStyles = makeStyles((_: Theme) =>
  createStyles({
    errorMessage: {
      marginTop: '1em',
      marginBottom: '1em',
    },
    options: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    content: {
      height: '80%',
    },
  }),
);

const PodDrawerButton = withStyles({
  root: {
    padding: '6px 5px',
  },
  label: {
    textTransform: 'none',
  },
})(Button);

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
        <Typography variant="body2">
          {t('linkErrorPanel.errorsLabel')} {errorMessage}
        </Typography>
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
  const classes = useDrawerContentStyles();
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
      <DrawerHeader>
        {object.metadata?.name ?? t('kubernetesDrawer.unknownName')}
      </DrawerHeader>
      <DrawerBody>
        <Typography color="textSecondary" variant="body1">
          {kind}
        </Typography>
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
        {error && (
          <div className={classes.errorMessage}>
            <LinkErrorPanel
              cluster={cluster}
              errorMessage={error.message || error.toString()}
            />
          </div>
        )}
        <div className={classes.options}>
          <div>
            {clusterLink && (
              <BackstageButton
                variant="outlined"
                color="primary"
                size="small"
                to={clusterLink}
                endIcon={<OpenInNewIcon />}
              >
                Open Kubernetes Dashboard
              </BackstageButton>
            )}
          </div>
        </div>
        <div className={classes.content}>
          {isYaml && <ManifestYaml object={object} />}
          {!isYaml && (
            <StructuredMetadataTable
              metadata={renderObject(replaceNullsWithUndefined(object))}
              options={{ nestedValuesAsYaml: true }}
            />
          )}
        </div>
      </DrawerBody>
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
      <PodDrawerButton
        onClick={e => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        onFocus={event => event.stopPropagation()}
      >
        {children === undefined ? (
          <Typography variant={buttonVariant}>
            {object.metadata?.name ?? 'unknown object'}
          </Typography>
        ) : (
          children
        )}
      </PodDrawerButton>
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
        <KubernetesStructuredMetadataTableDrawerContent
          kind={kind}
          object={object}
          renderObject={renderObject}
        />
      </Drawer>
    </>
  );
};
