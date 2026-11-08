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
import { useContext } from 'react';
import { Box, Flex, Text } from '@backstage/ui';
import type { V1Secret } from '@kubernetes/client-node';
import { SecretsDrawer } from './SecretsDrawer.tsx';
import { GroupedResponsesContext } from '../../hooks';
import { StructuredMetadataTable } from '@backstage/core-components';
import { KubernetesAccordion } from '../KubernetesAccordion';

type SecretSummaryProps = {
  secret: V1Secret;
};

const SecretSummary = ({ secret }: SecretSummaryProps) => {
  return (
    <Flex direction="row" justify="between" align="center" gap="4">
      <Box grow>
        <SecretsDrawer secret={secret} />
      </Box>
      <Text as="span" variant="body-medium" weight="bold">
        Data Count: {secret.data ? Object.keys(secret.data).length : 0}
      </Text>
    </Flex>
  );
};

type SecretsCardProps = {
  secret: V1Secret;
};

const SecretCard = ({ secret }: SecretsCardProps) => {
  const metadata: any = {};

  metadata.data = secret.data;

  return (
    <StructuredMetadataTable
      metadata={{
        ...metadata,
      }}
      options={{ nestedValuesAsYaml: true }}
    />
  );
};

export type SecretsAccordionsProps = {};

type SecretsAccordionProps = {
  secret: V1Secret;
};

const SecretsAccordion = ({ secret }: SecretsAccordionProps) => {
  return (
    <KubernetesAccordion
      label={secret.metadata?.name ?? 'unknown object'}
      summary={<SecretSummary secret={secret} />}
    >
      <SecretCard secret={secret} />
    </KubernetesAccordion>
  );
};

export const SecretsAccordions = ({}: SecretsAccordionsProps) => {
  const groupedResponses = useContext(GroupedResponsesContext);
  return (
    <Flex direction="column" gap="2">
      {groupedResponses.secrets.map((secret, i) => (
        <SecretsAccordion key={i} secret={secret} />
      ))}
    </Flex>
  );
};
