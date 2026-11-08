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
import type { V1PersistentVolume } from '@kubernetes/client-node';
import { PersistentVolumesTable } from './PersistentVolumesTable';
import { GroupedResponsesContext } from '../../hooks';
import { StatusOK, StatusError } from '@backstage/core-components';
import { KubernetesAccordion } from '../KubernetesAccordion';

type PersistentVolumesAccordionsProps = {
  children?: ReactNode;
};

type PersistentVolumesAccordionProps = {
  persistentVolumes: V1PersistentVolume[];
  children?: ReactNode;
};

type PersistentVolumesSummaryProps = {
  numberOfPersistentVolumes: number;
  numberOfBoundVolumes: number;
  numberOfFailedVolumes: number;
  children?: ReactNode;
};

const PersistentVolumesSummary = ({
  numberOfPersistentVolumes,
  numberOfBoundVolumes,
  numberOfFailedVolumes,
}: PersistentVolumesSummaryProps) => {
  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow basis="0">
        <Text as="span" variant="body-medium" weight="bold">
          PersistentVolumes
        </Text>
      </Box>
      <Flex direction="column" align="end" gap="1" grow basis="0">
        <StatusOK>{numberOfPersistentVolumes} volumes</StatusOK>
        <StatusOK>{numberOfBoundVolumes} bound</StatusOK>
        {numberOfFailedVolumes > 0 && (
          <StatusError>
            {numberOfFailedVolumes} volume
            {numberOfFailedVolumes > 1 ? 's' : ''} failed
          </StatusError>
        )}
      </Flex>
    </Flex>
  );
};

const PersistentVolumesAccordion = ({
  persistentVolumes,
}: PersistentVolumesAccordionProps) => {
  const boundVolumes = persistentVolumes.filter(
    pv => pv.status?.phase === 'Bound',
  );
  const failedVolumes = persistentVolumes.filter(
    pv => pv.status?.phase === 'Failed',
  );

  return (
    <KubernetesAccordion
      label="PersistentVolumes"
      summary={
        <PersistentVolumesSummary
          numberOfPersistentVolumes={persistentVolumes.length}
          numberOfBoundVolumes={boundVolumes.length}
          numberOfFailedVolumes={failedVolumes.length}
        />
      }
    >
      <PersistentVolumesTable persistentVolumes={persistentVolumes} />
    </KubernetesAccordion>
  );
};

export const PersistentVolumesAccordions =
  ({}: PersistentVolumesAccordionsProps) => {
    const groupedResponses = useContext(GroupedResponsesContext);

    return (
      <PersistentVolumesAccordion
        persistentVolumes={groupedResponses.persistentVolumes}
      />
    );
  };
