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

import { useApp } from '@backstage/core-plugin-api';
import OpenInNew from '@material-ui/icons/OpenInNew';

/**
 * Icon shown next to the text of sidebar items that link to an external URL.
 *
 * @internal
 */
export const ExternalLinkIcon = (props: { className?: string }) => {
  const app = useApp();
  const Icon = app.getSystemIcon('externalLink') || OpenInNew;
  return <Icon fontSize="inherit" className={props.className} />;
};
