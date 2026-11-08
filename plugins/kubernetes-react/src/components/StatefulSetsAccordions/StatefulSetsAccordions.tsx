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
import { Box, Flex, Text } from '@backstage/ui';
import type {
  V1Pod,
  V2HorizontalPodAutoscaler,
  V1StatefulSet,
} from '@kubernetes/client-node';
import { PodsTable } from '../Pods';
import { StatefulSetDrawer } from './StatefulSetDrawer';
import { HorizontalPodAutoscalerDrawer } from '../HorizontalPodAutoscalers';
import { getMatchingHpa, getOwnedResources } from '../../utils/owner';
import {
  GroupedResponsesContext,
  PodNamesWithErrorsContext,
} from '../../hooks';
import { StatusError, StatusOK } from '@backstage/core-components';
import { READY_COLUMNS, RESOURCE_COLUMNS } from '../Pods/PodsTable';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../translation';
import { KubernetesAccordion } from '../KubernetesAccordion';

type StatefulSetsAccordionsProps = {
  children?: ReactNode;
};

type StatefulSetAccordionProps = {
  statefulset: V1StatefulSet;
  ownedPods: V1Pod[];
  matchingHpa?: V2HorizontalPodAutoscaler;
  children?: ReactNode;
};

type StatefulSetSummaryProps = {
  statefulset: V1StatefulSet;
  numberOfCurrentPods: number;
  numberOfPodsWithErrors: number;
  hpa?: V2HorizontalPodAutoscaler;
  children?: ReactNode;
};

const StatefulSetSummary = ({
  statefulset,
  numberOfCurrentPods,
  numberOfPodsWithErrors,
  hpa,
}: StatefulSetSummaryProps) => {
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  const specCpuUtil = hpa?.spec?.metrics?.find(
    metric => metric.type === 'Resource' && metric.resource?.name === 'cpu',
  )?.resource?.target.averageUtilization;

  const cpuUtil = hpa?.status?.currentMetrics?.find(
    metric => metric.type === 'Resource' && metric.resource?.name === 'cpu',
  )?.resource?.current.averageUtilization;

  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow basis="0">
        <StatefulSetDrawer statefulset={statefulset} />
      </Box>
      {hpa && (
        <Box grow basis="0">
          <HorizontalPodAutoscalerDrawer hpa={hpa}>
            <Flex direction="column" align="start" gap="1">
              <Text as="span" variant="body-medium" weight="bold">
                {t('hpa.minReplicas')} {hpa.spec?.minReplicas ?? '?'} /{' '}
                {t('hpa.maxReplicas')} {hpa.spec?.maxReplicas ?? '?'}
              </Text>
              <Text as="span" variant="body-medium" weight="bold">
                {t('hpa.currentCpuUsage')} {cpuUtil ?? '?'}%
              </Text>
              <Text as="span" variant="body-medium" weight="bold">
                {t('hpa.targetCpuUsage')} {specCpuUtil ?? '?'}%
              </Text>
            </Flex>
          </HorizontalPodAutoscalerDrawer>
        </Box>
      )}
      <Flex direction="column" align="start" gap="1" grow basis="0">
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

const StatefulSetAccordion = ({
  statefulset,
  ownedPods,
  matchingHpa,
}: StatefulSetAccordionProps) => {
  const podNamesWithErrors = useContext(PodNamesWithErrorsContext);

  const podsWithErrors = ownedPods.filter(p =>
    podNamesWithErrors.has(p.metadata?.name ?? ''),
  );

  return (
    <KubernetesAccordion
      label={statefulset.metadata?.name ?? 'unknown object'}
      summary={
        <StatefulSetSummary
          statefulset={statefulset}
          numberOfCurrentPods={ownedPods.length}
          numberOfPodsWithErrors={podsWithErrors.length}
          hpa={matchingHpa}
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

export const StatefulSetsAccordions = ({}: StatefulSetsAccordionsProps) => {
  const groupedResponses = useContext(GroupedResponsesContext);

  return (
    <Flex direction="column" gap="2">
      {groupedResponses.statefulsets.map((statefulset, i) => (
        <StatefulSetAccordion
          key={i}
          matchingHpa={getMatchingHpa(
            {
              name: statefulset.metadata?.name,
              namespace: statefulset.metadata?.namespace,
              kind: 'statefulset',
            },
            groupedResponses.horizontalPodAutoscalers,
          )}
          ownedPods={getOwnedResources(statefulset, groupedResponses.pods)}
          statefulset={statefulset}
        />
      ))}
    </Flex>
  );
};
