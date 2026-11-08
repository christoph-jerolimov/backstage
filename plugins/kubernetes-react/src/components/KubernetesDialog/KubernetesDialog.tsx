/*
 * Copyright 2024 The Backstage Authors
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
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTrigger,
} from '@backstage/ui';
import { ReactElement, ReactNode } from 'react';
import styles from './KubernetesDialog.module.css';

export interface KubernetesDialogProps {
  buttonAriaLabel: string;
  buttonIcon: ReactElement;
  buttonText: string;
  children?: ReactNode;
  disabled?: boolean;
  title: string;
}

/**
 * Dialog component for use in the Kubernetes plugin
 *
 * @public
 */
export const KubernetesDialog = ({
  buttonAriaLabel,
  buttonIcon,
  buttonText,
  children,
  disabled,
  title,
}: KubernetesDialogProps) => {
  return (
    <DialogTrigger>
      <Button
        variant="secondary"
        aria-label={buttonAriaLabel}
        isDisabled={disabled}
        iconStart={buttonIcon}
      >
        {buttonText}
      </Button>
      <Dialog className={styles.dialog}>
        <DialogHeader>{title}</DialogHeader>
        <DialogBody className={styles.body}>{children}</DialogBody>
      </Dialog>
    </DialogTrigger>
  );
};
