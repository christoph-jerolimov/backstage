/*
 * Copyright 2022 The Backstage Authors
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
import { Badge } from '@backstage/ui';

export const TaskStatusColumn = ({ status }: { status: string }) => {
  switch (status) {
    case 'open':
      return <Badge isPending>{status}</Badge>;
    case 'processing':
      return (
        <Badge status="info" isPending>
          {status}
        </Badge>
      );
    case 'completed':
      return <Badge status="success">{status}</Badge>;
    case 'cancelled':
      return <Badge status="warning">{status}</Badge>;
    case 'failed':
    case 'error':
      return <Badge status="danger">{status}</Badge>;
    case 'skipped':
    default:
      return <Badge>{status}</Badge>;
  }
};
