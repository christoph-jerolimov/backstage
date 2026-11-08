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
import type { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import { PersistentVolumeClaimsTable } from './PersistentVolumeClaimsTable';
import { GroupedResponsesContext } from '../../hooks';
import { StatusOK, StatusError } from '@backstage/core-components';
import { KubernetesAccordion } from '../KubernetesAccordion';

type PersistentVolumeClaimsAccordionsProps = {
  children?: ReactNode;
};

type PersistentVolumeClaimsAccordionProps = {
  persistentVolumeClaims: V1PersistentVolumeClaim[];
  children?: ReactNode;
};

type PersistentVolumeClaimsSummaryProps = {
  numberOfPersistentVolumeClaims: number;
  numberOfBoundClaims: number;
  numberOfLostClaims: number;
  children?: ReactNode;
};

const PersistentVolumeClaimsSummary = ({
  numberOfPersistentVolumeClaims,
  numberOfBoundClaims,
  numberOfLostClaims,
}: PersistentVolumeClaimsSummaryProps) => {
  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow basis="0">
        <Text as="span" variant="body-medium" weight="bold">
          PersistentVolumeClaims
        </Text>
      </Box>
      <Flex direction="column" align="end" gap="1" grow basis="0">
        <StatusOK>{numberOfPersistentVolumeClaims} claims</StatusOK>
        <StatusOK>{numberOfBoundClaims} bound</StatusOK>
        {numberOfLostClaims > 0 && (
          <StatusError>
            {numberOfLostClaims} claim
            {numberOfLostClaims > 1 ? 's' : ''} lost
          </StatusError>
        )}
      </Flex>
    </Flex>
  );
};

const PersistentVolumeClaimsAccordion = ({
  persistentVolumeClaims,
}: PersistentVolumeClaimsAccordionProps) => {
  const boundClaims = persistentVolumeClaims.filter(
    pvc => pvc.status?.phase === 'Bound',
  );
  const lostClaims = persistentVolumeClaims.filter(
    pvc => pvc.status?.phase === 'Lost',
  );

  return (
    <KubernetesAccordion
      label="PersistentVolumeClaims"
      summary={
        <PersistentVolumeClaimsSummary
          numberOfPersistentVolumeClaims={persistentVolumeClaims.length}
          numberOfBoundClaims={boundClaims.length}
          numberOfLostClaims={lostClaims.length}
        />
      }
    >
      <PersistentVolumeClaimsTable
        persistentVolumeClaims={persistentVolumeClaims}
      />
    </KubernetesAccordion>
  );
};

export const PersistentVolumeClaimsAccordions =
  ({}: PersistentVolumeClaimsAccordionsProps) => {
    const groupedResponses = useContext(GroupedResponsesContext);

    return (
      <PersistentVolumeClaimsAccordion
        persistentVolumeClaims={groupedResponses.persistentVolumeClaims}
      />
    );
  };
