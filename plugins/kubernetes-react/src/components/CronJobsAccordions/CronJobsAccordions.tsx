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
import { ReactNode, useContext } from 'react';
import { Box, Flex, Text } from '@backstage/ui';
import type { V1CronJob, V1Job } from '@kubernetes/client-node';
import { JobsAccordions } from '../JobsAccordions';
import { CronJobDrawer } from './CronJobsDrawer';
import { getOwnedResources } from '../../utils/owner';
import { GroupedResponsesContext } from '../../hooks';
import { StatusError, StatusOK } from '@backstage/core-components';
import { humanizeCron } from '../../utils/crons';
import { KubernetesAccordion } from '../KubernetesAccordion';

/**
 *
 *
 * @public
 */
export type CronJobsAccordionsProps = {
  children?: ReactNode;
};

type CronJobAccordionProps = {
  cronJob: V1CronJob;
  ownedJobs: V1Job[];
  children?: ReactNode;
};

type CronJobSummaryProps = {
  cronJob: V1CronJob;
  children?: ReactNode;
};

const CronJobSummary = ({ cronJob }: CronJobSummaryProps) => {
  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow basis="0">
        <CronJobDrawer cronJob={cronJob} />
      </Box>
      <Flex direction="column" align="end" gap="1" grow basis="0">
        {cronJob.spec?.suspend ? (
          <StatusError>Suspended</StatusError>
        ) : (
          <StatusOK>Active</StatusOK>
        )}
        <Text as="span" variant="body-medium">
          Schedule:{' '}
          {cronJob.spec?.schedule
            ? `${cronJob.spec.schedule} (${humanizeCron(
                cronJob.spec.schedule,
              )})`
            : 'N/A'}
        </Text>
      </Flex>
    </Flex>
  );
};

const CronJobAccordion = ({ cronJob, ownedJobs }: CronJobAccordionProps) => {
  return (
    <KubernetesAccordion
      label={cronJob.metadata?.name ?? 'unknown object'}
      summary={<CronJobSummary cronJob={cronJob} />}
    >
      <JobsAccordions jobs={ownedJobs.reverse()} />
    </KubernetesAccordion>
  );
};

/**
 *
 *
 * @public
 */
export const CronJobsAccordions = ({}: CronJobsAccordionsProps) => {
  const groupedResponses = useContext(GroupedResponsesContext);

  return (
    <Flex direction="column" gap="2">
      {groupedResponses.cronJobs.map((cronJob, i) => (
        <CronJobAccordion
          key={i}
          ownedJobs={getOwnedResources(cronJob, groupedResponses.jobs)}
          cronJob={cronJob}
        />
      ))}
    </Flex>
  );
};
