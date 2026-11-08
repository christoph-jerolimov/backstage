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
import {
  Button,
  ButtonLink,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Flex,
  Text,
} from '@backstage/ui';
import { RiExternalLinkLine, RiQuestionLine } from '@remixicon/react';

import { Pod } from 'kubernetes-models/v1/Pod';
import { DetectedError } from '@backstage/plugin-kubernetes-common';
import { PodLogs } from '../PodLogs';
import { Events } from '../Events';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../../translation';
import styles from './FixDialog.module.css';

/**
 * Props for FixDialog
 *
 * @public
 */
export interface FixDialogProps {
  open?: boolean;
  clusterName: string;
  pod: Pod;
  error: DetectedError;
}

/**
 * A dialog for fixing detected Kubernetes errors
 *
 * @public
 */
export function FixDialog({ open, pod, error, clusterName }: FixDialogProps) {
  const { t } = useTranslationRef(kubernetesReactTranslationRef);

  const pf = error.proposedFix;

  const dialogContent = () => {
    return (
      <Flex direction="column" gap="4">
        <div>
          <Text as="h6" variant="title-x-small">
            {t('fixDialog.detectedError')}
          </Text>
          <Text as="p">{error.message}</Text>
        </div>
        <div>
          <Text as="h6" variant="title-x-small">
            {t('fixDialog.causeExplanation')}
          </Text>
          <Text as="p">
            {error.proposedFix?.rootCauseExplanation ?? t('podsTable.unknown')}
          </Text>
        </div>
        <div>
          <Text as="h6" variant="title-x-small">
            {t('fixDialog.fix')}
          </Text>
          <ul className={styles.actions}>
            {(error.proposedFix?.actions ?? []).map((fix, i) => {
              return (
                <li
                  key={`${
                    pod.metadata?.name ?? t('podsTable.unknown')
                  }-pf-${i}`}
                >
                  <Text as="span">{fix}</Text>
                </li>
              );
            })}
          </ul>
        </div>

        {pf && pf.type === 'logs' && (
          <div>
            <Text as="h6" variant="title-x-small">
              {t('fixDialog.crashLogs')}
            </Text>
            <PodLogs
              previous
              containerScope={{
                podName: pod.metadata?.name ?? t('podsTable.unknown'),
                podNamespace: pod.metadata?.namespace ?? t('podsTable.unknown'),
                cluster: { name: clusterName },
                containerName: pf.container,
              }}
            />
          </div>
        )}
        {pf && pf.type === 'events' && (
          <div>
            <Text as="h6" variant="title-x-small">
              {t('fixDialog.events')}
            </Text>
            <Events
              warningEventsOnly
              involvedObjectName={pod.metadata?.name ?? ''}
              namespace={pod.metadata?.namespace ?? ''}
              clusterName={clusterName}
            />
          </div>
        )}
      </Flex>
    );
  };

  return (
    <DialogTrigger defaultOpen={!!open}>
      <Button
        variant="secondary"
        aria-label={t('fixDialog.ariaLabels.fixIssue')}
        iconStart={<RiQuestionLine />}
      >
        {t('fixDialog.helpButton')}
      </Button>
      <Dialog className={styles.dialog}>
        <DialogHeader>
          {t('fixDialog.title', {
            podName: pod.metadata?.name ?? '',
            errorType: error.type,
          })}
        </DialogHeader>
        <DialogBody>{dialogContent()}</DialogBody>
        {pf && pf.type === 'docs' && (
          <DialogFooter>
            <ButtonLink
              href={pf.docsLink}
              variant="secondary"
              iconStart={<RiExternalLinkLine />}
              target="_blank"
              rel="noopener"
            >
              {t('fixDialog.openDocs')}
            </ButtonLink>
          </DialogFooter>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
