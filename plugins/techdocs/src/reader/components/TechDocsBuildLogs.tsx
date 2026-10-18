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

import { LogViewer } from '@backstage/core-components';
import { Drawer, DrawerBody, DrawerHeader } from '@backstage/ui';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { techdocsTranslationRef } from '../../translation';

const useDrawerStyles = makeStyles((theme: Theme) =>
  createStyles({
    logs: {
      background: theme.palette.background.default,
    },
  }),
);

export const TechDocsBuildLogsDrawerContent = ({
  buildLog,
}: {
  buildLog: string[];
}) => {
  const classes = useDrawerStyles();
  const { t } = useTranslationRef(techdocsTranslationRef);
  const logText =
    buildLog.length === 0 ? t('buildLogs.waitingForLogs') : buildLog.join('\n');
  return (
    <>
      <DrawerHeader>{t('buildLogs.title')}</DrawerHeader>
      <DrawerBody>
        <LogViewer text={logText} classes={{ root: classes.logs }} />
      </DrawerBody>
    </>
  );
};

export const TechDocsBuildLogs = ({ buildLog }: { buildLog: string[] }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslationRef(techdocsTranslationRef);

  return (
    <>
      <Button color="inherit" onClick={() => setOpen(true)}>
        {t('buildLogs.showBuildLogs')}
      </Button>
      <Drawer isOpen={open} onOpenChange={setOpen} width="max(50%, 360px)">
        <TechDocsBuildLogsDrawerContent buildLog={buildLog} />
      </Drawer>
    </>
  );
};
