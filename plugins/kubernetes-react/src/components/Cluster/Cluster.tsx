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

import { ReactNode } from 'react';
import { Box, Flex, Text } from '@backstage/ui';
import {
  ClientPodStatus,
  ClusterObjects,
  groupResponses,
} from '@backstage/plugin-kubernetes-common';
import { DeploymentsAccordions } from '../DeploymentsAccordions';
import { StatefulSetsAccordions } from '../StatefulSetsAccordions';
import { IngressesAccordions } from '../IngressesAccordions';
import { ServicesAccordions } from '../ServicesAccordions';
import { ConfigmapsAccordions } from '../ConfigmapsAccordions';
import { CronJobsAccordions } from '../CronJobsAccordions';
import { CustomResources } from '../CustomResources';
import { DaemonSetsAccordions } from '../DaemonSetsAccordions';
import { PersistentVolumesAccordions } from '../PersistentVolumesAccordions';
import { PersistentVolumeClaimsAccordions } from '../PersistentVolumesClaimsAccordions';
import {
  ClusterContext,
  GroupedResponsesContext,
  PodNamesWithErrorsContext,
} from '../../hooks';

import { StatusError, StatusOK } from '@backstage/core-components';
import { PodMetricsContext } from '../../hooks/usePodMetrics';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../translation';
import { SecretsAccordions } from '../SecretsAccordions';
import { KubernetesAccordion } from '../KubernetesAccordion';

type ClusterSummaryProps = {
  clusterName: string;
  totalNumberOfPods: number;
  numberOfPodsWithErrors: number;
  children?: ReactNode;
};

const ClusterSummary = ({
  clusterName,
  totalNumberOfPods,
  numberOfPodsWithErrors,
}: ClusterSummaryProps) => {
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  return (
    <Flex direction="row" justify="between" align="start" gap="4">
      <Box grow>
        <Text as="p" variant="body-medium">
          {clusterName}
        </Text>
        <Text as="p" variant="body-large" color="secondary">
          {t('cluster.label')}
        </Text>
      </Box>
      <Flex direction="column" align="end" gap="1">
        <StatusOK>{t('cluster.pods', { count: totalNumberOfPods })}</StatusOK>
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

/**
 * Props for Cluster
 *
 * @public
 */
export type ClusterProps = {
  clusterObjects: ClusterObjects;
  podsWithErrors: Set<string>;
  children?: ReactNode;
};

/**
 * Component for rendering Kubernetes resources in a cluster
 *
 * @public
 */
export const Cluster = ({ clusterObjects, podsWithErrors }: ClusterProps) => {
  const groupedResponses = groupResponses(clusterObjects.resources);
  const clusterName =
    clusterObjects.cluster.title || clusterObjects.cluster.name;

  const podMetricsMap = new Map<string, ClientPodStatus[]>();
  podMetricsMap.set(clusterObjects.cluster.name, clusterObjects.podMetrics);
  return (
    <ClusterContext.Provider value={clusterObjects.cluster}>
      <GroupedResponsesContext.Provider value={groupedResponses}>
        <PodMetricsContext.Provider value={podMetricsMap}>
          <PodNamesWithErrorsContext.Provider value={podsWithErrors}>
            <KubernetesAccordion
              label={clusterName}
              summary={
                <ClusterSummary
                  clusterName={clusterName}
                  totalNumberOfPods={groupedResponses.pods.length}
                  numberOfPodsWithErrors={podsWithErrors.size}
                />
              }
            >
              <Flex direction="column" gap="4">
                {groupedResponses.customResources.length > 0 ? (
                  <CustomResources />
                ) : undefined}
                {groupedResponses.deployments.length > 0 ? (
                  <DeploymentsAccordions />
                ) : undefined}
                {groupedResponses.daemonSets.length > 0 ? (
                  <DaemonSetsAccordions />
                ) : undefined}
                {groupedResponses.statefulsets.length > 0 ? (
                  <StatefulSetsAccordions />
                ) : undefined}
                {groupedResponses.ingresses.length > 0 ? (
                  <IngressesAccordions />
                ) : undefined}
                {groupedResponses.services.length > 0 ? (
                  <ServicesAccordions />
                ) : undefined}
                {groupedResponses.configMaps.length > 0 ? (
                  <ConfigmapsAccordions />
                ) : undefined}
                {groupedResponses.secrets.length > 0 ? (
                  <SecretsAccordions />
                ) : undefined}
                {groupedResponses.persistentVolumes.length > 0 ? (
                  <PersistentVolumesAccordions />
                ) : undefined}
                {groupedResponses.persistentVolumeClaims.length > 0 ? (
                  <PersistentVolumeClaimsAccordions />
                ) : undefined}
                {groupedResponses.cronJobs.length > 0 ? (
                  <CronJobsAccordions />
                ) : undefined}
              </Flex>
            </KubernetesAccordion>
          </PodNamesWithErrorsContext.Provider>
        </PodMetricsContext.Provider>
      </GroupedResponsesContext.Provider>
    </ClusterContext.Provider>
  );
};
