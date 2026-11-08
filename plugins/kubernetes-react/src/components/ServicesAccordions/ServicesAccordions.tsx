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

import { useContext } from 'react';
import { Box, Flex, Text } from '@backstage/ui';
import type { V1Service } from '@kubernetes/client-node';
import { ServiceDrawer } from './ServiceDrawer';
import { GroupedResponsesContext } from '../../hooks';
import { StructuredMetadataTable } from '@backstage/core-components';
import { KubernetesAccordion } from '../KubernetesAccordion';

type ServiceSummaryProps = {
  service: V1Service;
};

const ServiceSummary = ({ service }: ServiceSummaryProps) => {
  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow>
        <ServiceDrawer service={service} />
      </Box>
      <Text as="span" variant="body-medium" weight="bold">
        Type: {service.spec?.type ?? '?'}
      </Text>
    </Flex>
  );
};

type ServiceCardProps = {
  service: V1Service;
};

const ServiceCard = ({ service }: ServiceCardProps) => {
  const metadata: any = {};

  if (service.status?.loadBalancer?.ingress?.length ?? -1 > 0) {
    metadata.loadbalancer = service.status?.loadBalancer;
  }

  if (service.spec?.type === 'ClusterIP') {
    metadata.clusterIP = service.spec.clusterIP;
  }
  if (service.spec?.type === 'ExternalName') {
    metadata.externalName = service.spec.externalName;
  }

  return (
    <StructuredMetadataTable
      metadata={{
        type: service.spec?.type,
        ports: service.spec?.ports,
        ...metadata,
      }}
      options={{ nestedValuesAsYaml: true }}
    />
  );
};

/**
 *
 *
 * @public
 */
export type ServicesAccordionsProps = {};

type ServiceAccordionProps = {
  service: V1Service;
};

const ServiceAccordion = ({ service }: ServiceAccordionProps) => {
  return (
    <KubernetesAccordion
      label={service.metadata?.name ?? 'unknown object'}
      summary={<ServiceSummary service={service} />}
    >
      <ServiceCard service={service} />
    </KubernetesAccordion>
  );
};

/**
 *
 *
 * @public
 */
export const ServicesAccordions = ({}: ServicesAccordionsProps) => {
  const groupedResponses = useContext(GroupedResponsesContext);
  return (
    <Flex direction="column" gap="2">
      {groupedResponses.services.map((service, i) => (
        <ServiceAccordion key={i} service={service} />
      ))}
    </Flex>
  );
};
