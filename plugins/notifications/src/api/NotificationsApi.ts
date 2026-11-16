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
import { createApiRef } from '@backstage/core-plugin-api';
import {
  Notification,
  NotificationSettings,
  NotificationSeverity,
  NotificationStatus,
} from '@backstage/plugin-notifications-common';

/** @public */
export const notificationsApiRef = createApiRef<NotificationsApi>({
  id: 'plugin.notifications.service',
});

/** @public */
export type GetNotificationsCommonOptions = {
  search?: string;
  origin?: string;
  read?: boolean;
  saved?: boolean;
  createdAfter?: Date;
  minimumSeverity?: NotificationSeverity;
};

/** @public */
export type GetNotificationsOptions = GetNotificationsCommonOptions & {
  offset?: number;
  limit?: number;
  sort?: 'created' | 'topic' | 'origin';
  sortOrder?: 'asc' | 'desc';
  topic?: string;
};

/** @public */
export type GetTopicsOptions = GetNotificationsCommonOptions;

/** @public */
export type GetFacetsOptions = GetNotificationsCommonOptions & {
  topic?: string;
};

/** @public */
export type UpdateNotificationsOptions = {
  ids: string[];
  read?: boolean;
  saved?: boolean;
};

/** @public */
export type GetNotificationsResponse = {
  notifications: Notification[];
  totalCount: number;
};

/** @public */
export type GetTopicsResponse = {
  topics: string[];
};

/** @public */
export type NotificationFacet = {
  value: string;
  count: number;
};

/**
 * The number of notifications per value of each filter. Each facet is counted
 * with all filters applied except for the one that the facet itself represents.
 *
 * @public
 */
export type GetFacetsResponse = {
  facets: {
    /** Counts per origin, sorted by origin */
    origin: NotificationFacet[];
    /** Counts per topic, sorted by topic */
    topic: NotificationFacet[];
    /** Counts per exact severity, from most to least severe */
    severity: NotificationFacet[];
    /** Counts of read (`'true'`) and unread (`'false'`) notifications */
    read: NotificationFacet[];
    /** Counts of saved (`'true'`) and not saved (`'false'`) notifications */
    saved: NotificationFacet[];
  };
};

/** @public */
export interface NotificationsApi {
  getNotifications(
    options?: GetNotificationsOptions,
  ): Promise<GetNotificationsResponse>;

  getNotification(id: string): Promise<Notification>;

  getStatus(): Promise<NotificationStatus>;

  updateNotifications(
    options: UpdateNotificationsOptions,
  ): Promise<Notification[]>;

  getNotificationSettings(): Promise<NotificationSettings>;

  updateNotificationSettings(
    settings: NotificationSettings,
  ): Promise<NotificationSettings>;

  getTopics(options?: GetTopicsOptions): Promise<GetTopicsResponse>;

  getFacets(options?: GetFacetsOptions): Promise<GetFacetsResponse>;
}
