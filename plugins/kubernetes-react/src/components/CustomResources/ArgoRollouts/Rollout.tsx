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
import { RiErrorWarningLine, RiPauseLine } from '@remixicon/react';
import type { V1Pod, V2HorizontalPodAutoscaler } from '@kubernetes/client-node';
import { PodsTable } from '../../Pods';
import { HorizontalPodAutoscalerDrawer } from '../../HorizontalPodAutoscalers';
import { RolloutDrawer } from './RolloutDrawer';
import { DateTime } from 'luxon';
import { StepsProgress } from './StepsProgress';
import {
  PodNamesWithErrorsContext,
  GroupedResponsesContext,
} from '../../../hooks';
import {
  getMatchingHpa,
  getOwnedPodsThroughReplicaSets,
} from '../../../utils/owner';
import { StatusError, StatusOK } from '@backstage/core-components';
import { READY_COLUMNS, RESOURCE_COLUMNS } from '../../Pods/PodsTable';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../../translation';
import { KubernetesAccordion } from '../../KubernetesAccordion';

type RolloutAccordionsProps = {
  rollouts: any[];
  defaultExpanded?: boolean;
  children?: ReactNode;
};

type RolloutAccordionProps = {
  rollout: any;
  ownedPods: V1Pod[];
  defaultExpanded?: boolean;
  matchingHpa?: V2HorizontalPodAutoscaler;
  children?: ReactNode;
};

type RolloutSummaryProps = {
  rollout: any;
  numberOfCurrentPods: number;
  numberOfPodsWithErrors: number;
  hpa?: V2HorizontalPodAutoscaler;
  children?: ReactNode;
};

const AbortedTitle = (
  <Flex align="center" gap="1">
    <RiErrorWarningLine />
    <Text as="span" variant="body-large">
      Aborted
    </Text>
  </Flex>
);

const findAbortedMessage = (rollout: any): string | undefined =>
  rollout.status?.conditions?.find(
    (c: any) =>
      c.type === 'Progressing' &&
      c.status === 'False' &&
      c.reason === 'RolloutAborted',
  )?.message;

const RolloutSummary = ({
  rollout,
  numberOfCurrentPods,
  numberOfPodsWithErrors,
  hpa,
}: RolloutSummaryProps) => {
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  const pauseTime: string | undefined = rollout.status?.pauseConditions?.find(
    (p: any) => p.reason === 'CanaryPauseStep',
  )?.startTime;
  const abortedMessage = findAbortedMessage(rollout);
  const specCpuUtil = hpa?.spec?.metrics?.find(
    metric => metric.type === 'Resource' && metric.resource?.name === 'cpu',
  )?.resource?.target.averageUtilization;

  const cpuUtil = hpa?.status?.currentMetrics?.find(
    metric => metric.type === 'Resource' && metric.resource?.name === 'cpu',
  )?.resource?.current.averageUtilization;

  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow basis="0">
        <RolloutDrawer rollout={rollout} />
      </Box>
      {hpa && (
        <Box grow basis="0">
          <HorizontalPodAutoscalerDrawer hpa={hpa}>
            <Flex direction="column" align="start" gap="1">
              <Text as="span" variant="body-medium" weight="bold">
                {t('hpa.replicasSummary', {
                  min: String(hpa.spec?.minReplicas ?? '?'),
                  max: String(hpa.spec?.maxReplicas ?? '?'),
                })}
              </Text>
              <Text as="span" variant="body-medium" weight="bold">
                {t('hpa.currentCpuUsageLabel', {
                  value: String(cpuUtil ?? '?'),
                })}
              </Text>
              <Text as="span" variant="body-medium" weight="bold">
                {t('hpa.targetCpuUsageLabel', {
                  value: String(specCpuUtil ?? '?'),
                })}
              </Text>
            </Flex>
          </HorizontalPodAutoscalerDrawer>
        </Box>
      )}
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
      {pauseTime && (
        <Flex align="center" gap="1" grow basis="0">
          <RiPauseLine />
          <Text as="span" variant="body-large">
            Paused ({DateTime.fromISO(pauseTime).toRelative({ locale: 'en' })})
          </Text>
        </Flex>
      )}
      {abortedMessage && (
        <Box grow basis="0">
          {AbortedTitle}
        </Box>
      )}
    </Flex>
  );
};

const RolloutAccordion = ({
  rollout,
  ownedPods,
  matchingHpa,
  defaultExpanded,
}: RolloutAccordionProps) => {
  const podNamesWithErrors = useContext(PodNamesWithErrorsContext);

  const podsWithErrors = ownedPods.filter(p =>
    podNamesWithErrors.has(p.metadata?.name ?? ''),
  );

  const currentStepIndex = rollout.status?.currentStepIndex ?? 0;
  const abortedMessage = findAbortedMessage(rollout);

  return (
    <KubernetesAccordion
      label={rollout.metadata?.name ?? 'unknown object'}
      defaultExpanded={defaultExpanded}
      summary={
        <RolloutSummary
          rollout={rollout}
          numberOfCurrentPods={ownedPods.length}
          numberOfPodsWithErrors={podsWithErrors.length}
          hpa={matchingHpa}
        />
      }
    >
      <Flex direction="column" gap="4">
        <Text as="h6" variant="title-x-small">
          Rollout status
        </Text>
        <Box px="4">
          {abortedMessage && (
            <>
              {AbortedTitle}
              <Text as="p" variant="body-medium" weight="bold">
                {abortedMessage}
              </Text>
            </>
          )}
          <StepsProgress
            aborted={abortedMessage !== undefined}
            steps={rollout.spec?.strategy?.canary?.steps ?? []}
            currentStepIndex={currentStepIndex}
          />
        </Box>
        <PodsTable
          pods={ownedPods}
          extraColumns={[READY_COLUMNS, RESOURCE_COLUMNS]}
        />
      </Flex>
    </KubernetesAccordion>
  );
};

export const RolloutAccordions = ({
  rollouts,
  defaultExpanded = false,
}: RolloutAccordionsProps) => {
  const groupedResponses = useContext(GroupedResponsesContext);

  return (
    <Flex direction="column" gap="2">
      {rollouts.map((rollout, i) => (
        <RolloutAccordion
          key={i}
          defaultExpanded={defaultExpanded}
          matchingHpa={getMatchingHpa(
            {
              name: rollout.metadata?.name,
              namespace: rollout.metadata?.namespace,
              kind: 'rollout',
            },
            groupedResponses.horizontalPodAutoscalers,
          )}
          ownedPods={getOwnedPodsThroughReplicaSets(
            rollout,
            groupedResponses.replicaSets,
            groupedResponses.pods,
          )}
          rollout={rollout}
        />
      ))}
    </Flex>
  );
};
