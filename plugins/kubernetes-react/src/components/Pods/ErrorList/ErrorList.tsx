/*
 * Copyright 2023 The Backstage Authors
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
import { Box, Flex, Text } from '@backstage/ui';
import { PodAndErrors } from '../types';
import { FixDialog } from '../FixDialog/FixDialog';
import styles from './ErrorList.module.css';

/**
 * Props for ErrorList
 *
 * @public
 */
export interface ErrorListProps {
  podAndErrors: PodAndErrors[];
}

/**
 * Shows a list of errors found on a Pod
 *
 * @public
 */
export const ErrorList = ({ podAndErrors }: ErrorListProps) => {
  return (
    <Box bg="neutral" className={styles.root}>
      <ul className={styles.list}>
        {podAndErrors
          .filter(pae => pae.errors.length > 0)
          .flatMap(onlyPodWithErrors => {
            return onlyPodWithErrors.errors.map((error, i) => {
              return (
                <li
                  key={`${
                    onlyPodWithErrors.pod.metadata?.name ?? 'unknown'
                  }-eli-${i}`}
                  className={styles.item}
                >
                  <Flex justify="between" align="center" gap="4">
                    <Box grow>
                      <Text as="p" variant="body-medium">
                        {error.message}
                      </Text>
                      <Text as="p" variant="body-small" color="secondary">
                        {onlyPodWithErrors.pod.metadata?.name}
                      </Text>
                    </Box>
                    <FixDialog
                      pod={onlyPodWithErrors.pod}
                      error={error}
                      clusterName={onlyPodWithErrors.cluster.name}
                    />
                  </Flex>
                </li>
              );
            });
          })}
      </ul>
    </Box>
  );
};
