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

import { KubernetesStructuredMetadataTableDrawer } from '../KubernetesDrawer';
import { Flex, Text } from '@backstage/ui';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const DefaultCustomResourceDrawer = ({
  customResource,
  customResourceName,
  expanded,
}: {
  customResource: any;
  customResourceName: string;
  expanded?: boolean;
}) => {
  const capitalizedName = capitalize(customResourceName);

  return (
    <KubernetesStructuredMetadataTableDrawer
      object={customResource}
      expanded={expanded}
      kind={capitalizedName}
      renderObject={cr => cr}
    >
      <Flex direction="column" align="start" gap="1">
        <Text as="span" variant="body-medium">
          {customResource.metadata?.name ?? 'unknown object'}
        </Text>
        <Text as="span" variant="body-large" color="secondary">
          {capitalizedName}
        </Text>
      </Flex>
    </KubernetesStructuredMetadataTableDrawer>
  );
};
