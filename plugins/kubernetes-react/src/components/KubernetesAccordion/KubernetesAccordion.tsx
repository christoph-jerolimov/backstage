/*
 * Copyright 2026 The Backstage Authors
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

import { ReactNode, useState } from 'react';
import {
  Accordion,
  AccordionPanel,
  AccordionTrigger,
  VisuallyHidden,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { kubernetesReactTranslationRef } from '../../translation';
import styles from './KubernetesAccordion.module.css';

export interface KubernetesAccordionProps {
  /**
   * Name of the resource that the accordion represents, used for the
   * accessible name of the expand/collapse button.
   */
  label: string;
  /**
   * Content shown in the accordion header. May contain interactive elements
   * such as drawer buttons, which are rendered next to, and not inside, the
   * expand/collapse button.
   */
  summary: ReactNode;
  defaultExpanded?: boolean;
  /**
   * Content shown when the accordion is expanded. It is only mounted while
   * the accordion is expanded.
   */
  children?: ReactNode;
}

/**
 * Accordion used throughout the Kubernetes plugin. The whole header toggles
 * the accordion, while buttons placed in the summary keep working on their
 * own without toggling it.
 */
export const KubernetesAccordion = ({
  label,
  summary,
  defaultExpanded = false,
  children,
}: KubernetesAccordionProps) => {
  const { t } = useTranslationRef(kubernetesReactTranslationRef);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Accordion
      className={styles.accordion}
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
    >
      <div className={styles.header}>
        <AccordionTrigger className={styles.trigger}>
          <VisuallyHidden>
            {t('kubernetesAccordion.toggleDetails', { name: label })}
          </VisuallyHidden>
        </AccordionTrigger>
        <div className={styles.summary}>{summary}</div>
      </div>
      <AccordionPanel className={styles.panel}>
        {isExpanded && children}
      </AccordionPanel>
    </Accordion>
  );
};
