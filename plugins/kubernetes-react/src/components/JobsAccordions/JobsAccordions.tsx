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
import type { V1Job, V1Pod } from '@kubernetes/client-node';
import { PodsTable } from '../Pods';
import { JobDrawer } from './JobsDrawer';
import { getOwnedResources } from '../../utils/owner';
import { GroupedResponsesContext } from '../../hooks';
import {
  StatusError,
  StatusOK,
  StatusPending,
} from '@backstage/core-components';
import { KubernetesAccordion } from '../KubernetesAccordion';

/**
 *
 *
 * @public
 */
export type JobsAccordionsProps = {
  jobs: V1Job[];
  children?: ReactNode;
};

type JobAccordionProps = {
  job: V1Job;
  ownedPods: V1Pod[];
  children?: ReactNode;
};

type JobSummaryProps = {
  job: V1Job;
  children?: ReactNode;
};

const JobSummary = ({ job }: JobSummaryProps) => {
  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow basis="0">
        <JobDrawer job={job} />
      </Box>
      <Flex direction="column" align="end" gap="1" grow basis="0">
        <div>
          {job.status?.succeeded && <StatusOK>Succeeded</StatusOK>}
          {job.status?.active && <StatusPending>Running</StatusPending>}
          {job.status?.failed && <StatusError>Failed</StatusError>}
        </div>
        <Text as="span" variant="body-small">
          Start time: {job.status?.startTime?.toString()}
        </Text>
        {job.status?.completionTime && (
          <Text as="span" variant="body-small">
            Completion time: {job.status.completionTime.toString()}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

const JobAccordion = ({ job, ownedPods }: JobAccordionProps) => {
  return (
    <KubernetesAccordion
      label={job.metadata?.name ?? 'unknown object'}
      summary={<JobSummary job={job} />}
    >
      <PodsTable pods={ownedPods} />
    </KubernetesAccordion>
  );
};

/**
 *
 *
 * @public
 */
export const JobsAccordions = ({ jobs }: JobsAccordionsProps) => {
  const groupedResponses = useContext(GroupedResponsesContext);

  return (
    <Flex direction="column" gap="2">
      {jobs.map((job, i) => (
        <JobAccordion
          key={i}
          ownedPods={getOwnedResources(job, groupedResponses.pods)}
          job={job}
        />
      ))}
    </Flex>
  );
};
