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

import { ReactNode, useContext } from 'react';
import { Box, Flex } from '@backstage/ui';
import type { V1Pod, V1DaemonSet } from '@kubernetes/client-node';
import { PodsTable } from '../Pods';
import { DaemonSetDrawer } from './DaemonSetsDrawer';
import { getOwnedResources } from '../../utils/owner';
import {
  GroupedResponsesContext,
  PodNamesWithErrorsContext,
} from '../../hooks';
import { StatusError, StatusOK } from '@backstage/core-components';
import { READY_COLUMNS, RESOURCE_COLUMNS } from '../Pods/PodsTable';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../translation';
import { KubernetesAccordion } from '../KubernetesAccordion';

type DaemonSetsAccordionsProps = {
  children?: ReactNode;
};

type DaemonSetAccordionProps = {
  daemonset: V1DaemonSet;
  ownedPods: V1Pod[];
  children?: ReactNode;
};

type DaemonSetSummaryProps = {
  daemonset: V1DaemonSet;
  numberOfCurrentPods: number;
  numberOfPodsWithErrors: number;
  children?: ReactNode;
};

const DaemonSetSummary = ({
  daemonset,
  numberOfCurrentPods,
  numberOfPodsWithErrors,
}: DaemonSetSummaryProps) => {
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow basis="0">
        <DaemonSetDrawer daemonset={daemonset} />
      </Box>
      <Flex direction="column" align="end" gap="1" grow basis="0">
        <StatusOK>{t('pods.pods', { count: numberOfCurrentPods })}</StatusOK>
        {numberOfPodsWithErrors > 0 ? (
          <StatusError>
            {t('cluster.podsWithErrors', { count: numberOfPodsWithErrors })}
          </StatusError>
        ) : (
          <StatusOK>{t('cluster.noPodsWithErrors')}</StatusOK>
        )}
      </Flex>
    </Flex>
  );
};

const DaemonSetAccordion = ({
  daemonset,
  ownedPods,
}: DaemonSetAccordionProps) => {
  const podNamesWithErrors = useContext(PodNamesWithErrorsContext);

  const podsWithErrors = ownedPods.filter(p =>
    podNamesWithErrors.has(p.metadata?.name ?? ''),
  );

  return (
    <KubernetesAccordion
      label={daemonset.metadata?.name ?? 'unknown object'}
      summary={
        <DaemonSetSummary
          daemonset={daemonset}
          numberOfCurrentPods={ownedPods.length}
          numberOfPodsWithErrors={podsWithErrors.length}
        />
      }
    >
      <PodsTable
        pods={ownedPods}
        extraColumns={[READY_COLUMNS, RESOURCE_COLUMNS]}
      />
    </KubernetesAccordion>
  );
};

export const DaemonSetsAccordions = ({}: DaemonSetsAccordionsProps) => {
  const groupedResponses = useContext(GroupedResponsesContext);

  return (
    <Flex direction="column" gap="2">
      {groupedResponses.daemonSets.map((daemonset, i) => (
        <DaemonSetAccordion
          key={i}
          ownedPods={getOwnedResources(daemonset, groupedResponses.pods)}
          daemonset={daemonset}
        />
      ))}
    </Flex>
  );
};
