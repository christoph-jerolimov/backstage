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

import { ReactNode } from 'react';
import { Flex } from '@backstage/ui';
import { DefaultCustomResourceDrawer } from './DefaultCustomResourceDrawer';
import { StructuredMetadataTable } from '@backstage/core-components';
import { KubernetesAccordion } from '../KubernetesAccordion';

type DefaultCustomResourceAccordionsProps = {
  customResources: any[];
  customResourceName: string;
  defaultExpanded?: boolean;
  children?: ReactNode;
};

type DefaultCustomResourceAccordionProps = {
  customResource: any;
  customResourceName: string;
  defaultExpanded?: boolean;
  children?: ReactNode;
};

type DefaultCustomResourceSummaryProps = {
  customResource: any;
  customResourceName: string;
  children?: ReactNode;
};

const DefaultCustomResourceSummary = ({
  customResource,
  customResourceName,
}: DefaultCustomResourceSummaryProps) => {
  return (
    <Flex direction="row" justify="between" align="center">
      <DefaultCustomResourceDrawer
        customResource={customResource}
        customResourceName={customResourceName}
      />
    </Flex>
  );
};

const DefaultCustomResourceAccordion = ({
  customResource,
  customResourceName,
  defaultExpanded,
}: DefaultCustomResourceAccordionProps) => {
  return (
    <KubernetesAccordion
      label={customResource.metadata?.name ?? 'unknown object'}
      defaultExpanded={defaultExpanded}
      summary={
        <DefaultCustomResourceSummary
          customResource={customResource}
          customResourceName={customResourceName}
        />
      }
    >
      {Object.prototype.hasOwnProperty.call(customResource, 'status') && (
        <StructuredMetadataTable
          metadata={customResource.status}
          options={{ nestedValuesAsYaml: true }}
        />
      )}
    </KubernetesAccordion>
  );
};

export const DefaultCustomResourceAccordions = ({
  customResources,
  customResourceName,
  defaultExpanded = false,
}: DefaultCustomResourceAccordionsProps) => {
  return (
    <Flex direction="column" gap="2">
      {customResources.map((cr, i) => (
        <DefaultCustomResourceAccordion
          key={i}
          defaultExpanded={defaultExpanded}
          customResource={cr}
          customResourceName={customResourceName}
        />
      ))}
    </Flex>
  );
};
