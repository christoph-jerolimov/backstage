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
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import throttle from 'lodash/throttle';
import { Notification } from '@backstage/plugin-notifications-common';
import {
  Button,
  Cell,
  Checkbox,
  Column,
  ColumnConfig,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Flex,
  SearchField,
  Table,
  Text,
  VisuallyHidden,
} from '@backstage/ui';
import { RiRssFill } from '@remixicon/react';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { Link } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { notificationsTranslationRef } from '../../translation';

import { notificationsApiRef } from '../../api';
import { SelectAll } from './SelectAll';
import { BulkActions } from './BulkActions';
import { NotificationIcon } from './NotificationIcon';
import { NotificationDescription } from './NotificationDescription';
import { RelativeTime } from '../RelativeTime/RelativeTime';

import styles from './NotificationsTable.module.css';

const ThrottleDelayMs = 1000;

const DefaultPageSizeOptions = [5, 10, 20];

const SelectionColumnWidth = 80;
const ActionsColumnWidth = 136;

/** @public */
export type NotificationsTableProps = {
  title?: string | ReactElement;
  /** The zero-based index of the current page. */
  page?: number;
  /** The total number of notifications across all pages. */
  totalCount?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onRowsPerPageChange?: (pageSize: number) => void;
  markAsReadOnLinkOpen?: boolean;
  isLoading?: boolean;
  isUnread: boolean;
  notifications?: Notification[];
  highlightedNotificationId?: string;
  onUpdate: () => void;
  setContainsText: (search: string) => void;
  pageSize: number;
};

/** @public */
export const NotificationsTable = ({
  title,
  markAsReadOnLinkOpen,
  isLoading,
  notifications: notificationsProp,
  highlightedNotificationId,
  isUnread,
  onUpdate,
  setContainsText,
  onPageChange,
  onRowsPerPageChange,
  page = 0,
  pageSize,
  totalCount,
}: NotificationsTableProps) => {
  const notifications = useMemo(
    () => notificationsProp ?? [],
    [notificationsProp],
  );
  const { t } = useTranslationRef(notificationsTranslationRef);
  const notificationsApi = useApi(notificationsApiRef);
  const toastApi = useApi(toastApiRef);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [selectedNotifications, setSelectedNotifications] = useState(
    new Set<Notification['id']>(),
  );

  const onNotificationsSelectChange = useCallback(
    (ids: Notification['id'][], checked: boolean) => {
      let newSelect: Set<Notification['id']>;
      if (checked) {
        newSelect = new Set([...selectedNotifications, ...ids]);
      } else {
        newSelect = new Set(selectedNotifications);
        ids.forEach(id => newSelect.delete(id));
      }
      setSelectedNotifications(newSelect);
    },
    [selectedNotifications, setSelectedNotifications],
  );

  const onSwitchReadStatus = useCallback(
    (ids: Notification['id'][], newStatus: boolean) => {
      notificationsApi
        .updateNotifications({
          ids,
          read: newStatus,
        })
        .then(onUpdate);
    },
    [notificationsApi, onUpdate],
  );

  const onSwitchSavedStatus = useCallback(
    (ids: Notification['id'][], newStatus: boolean) => {
      notificationsApi
        .updateNotifications({
          ids,
          saved: newStatus,
        })
        .then(onUpdate);
    },
    [notificationsApi, onUpdate],
  );

  const doMarkAllRead = useCallback(async () => {
    setConfirmDialogOpen(false);
    try {
      const result = await notificationsApi.getNotifications({ read: false });
      const ids =
        result.notifications?.map(notification => notification.id) ?? [];
      if (ids.length === 0) return;
      await notificationsApi.updateNotifications({ ids, read: true });
      onUpdate();
    } catch {
      toastApi.post({
        title: t('table.errors.markAllReadFailed'),
        status: 'danger',
      });
    }
  }, [notificationsApi, onUpdate, toastApi, t]);

  const onMarkAllRead = useCallback(() => {
    setConfirmDialogOpen(true);
  }, []);

  const throttledContainsTextHandler = useMemo(
    () =>
      throttle((search: string) => {
        setContainsText(search);
        // The current page may not exist in the filtered result.
        onPageChange?.(0, pageSize);
      }, ThrottleDelayMs),
    [setContainsText, onPageChange, pageSize],
  );

  useEffect(() => {
    const allShownIds = new Set(notifications.map(n => n.id));
    const intersect = [...selectedNotifications].filter(id =>
      allShownIds.has(id),
    );
    if (selectedNotifications.size !== intersect.length) {
      setSelectedNotifications(new Set(intersect));
    }
  }, [notifications, selectedNotifications]);

  const focusedHighlightedIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!highlightedNotificationId) {
      focusedHighlightedIdRef.current = undefined;
      return;
    }

    // Only scroll/focus once per deep-linked id so refreshes don't steal focus.
    if (focusedHighlightedIdRef.current === highlightedNotificationId) {
      return;
    }

    const highlightedElement = document.getElementById(
      `notification-${highlightedNotificationId}`,
    );
    if (!highlightedElement) {
      return;
    }

    if (typeof highlightedElement.scrollIntoView === 'function') {
      highlightedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
    highlightedElement.focus({ preventScroll: true });
    focusedHighlightedIdRef.current = highlightedNotificationId;
  }, [highlightedNotificationId, notifications]);

  const compactColumns = useMemo((): ColumnConfig<Notification>[] => {
    const showToolbar = notifications.length > 0;
    return [
      {
        /* selection column */
        id: 'selection',
        label: t('table.columns.selection'),
        width: SelectionColumnWidth,
        header: () => (
          <Column id="selection" width={SelectionColumnWidth}>
            {showToolbar ? (
              <SelectAll
                count={selectedNotifications.size}
                totalCount={notifications.length}
                onSelectAll={() =>
                  onNotificationsSelectChange(
                    notifications.map(notification => notification.id),
                    selectedNotifications.size !== notifications.length,
                  )
                }
              />
            ) : (
              <VisuallyHidden>{t('table.columns.selection')}</VisuallyHidden>
            )}
          </Column>
        ),
        cell: (notification: Notification) => (
          <Cell>
            <Checkbox
              // Opt out of the row selection checkbox slots provided by the table
              slot={null}
              aria-label="Select notification"
              isSelected={selectedNotifications.has(notification.id)}
              onChange={checked =>
                onNotificationsSelectChange([notification.id], checked)
              }
            />
          </Cell>
        ),
      },
      {
        /* compact-data column */
        id: 'notification',
        label: t('table.columns.notification'),
        isRowHeader: true,
        header: () => (
          <Column id="notification" isRowHeader>
            <VisuallyHidden>{t('table.columns.notification')}</VisuallyHidden>
          </Column>
        ),
        cell: (notification: Notification) => {
          const isHighlighted = highlightedNotificationId === notification.id;
          // Compact content
          return (
            <Cell
              textValue={notification.payload.title}
              className={styles.notificationCell}
            >
              <div
                id={`notification-${notification.id}`}
                tabIndex={isHighlighted ? -1 : undefined}
                className={
                  isHighlighted ? styles.highlightedNotification : undefined
                }
              >
                <Flex gap="4" align="center">
                  <div className={styles.severityItem}>
                    <NotificationIcon notification={notification} />
                  </div>
                  <Flex direction="column" gap="1">
                    <Text variant="body-medium">
                      {notification.payload.link ? (
                        <Link
                          to={notification.payload.link}
                          onClick={() => {
                            if (markAsReadOnLinkOpen && !notification.read) {
                              onSwitchReadStatus([notification.id], true);
                            }
                          }}
                        >
                          {notification.payload.title}
                        </Link>
                      ) : (
                        notification.payload.title
                      )}
                    </Text>
                    {notification.payload.description ? (
                      <NotificationDescription
                        description={notification.payload.description}
                      />
                    ) : null}

                    <Text variant="body-small" color="secondary">
                      {!notification.user && (
                        <RiRssFill size={14} className={styles.broadcastIcon} />
                      )}
                      {notification.origin && (
                        <>
                          <span className={styles.notificationInfoRow}>
                            {notification.origin}
                          </span>
                          &bull;
                        </>
                      )}
                      {notification.payload.topic && (
                        <>
                          <span className={styles.notificationInfoRow}>
                            {notification.payload.topic}
                          </span>
                          &bull;
                        </>
                      )}
                      {notification.created && (
                        <RelativeTime
                          value={notification.created}
                          className={styles.notificationInfoRow}
                        />
                      )}
                    </Text>
                  </Flex>
                </Flex>
              </div>
            </Cell>
          );
        },
      },
      {
        /* actions column */
        id: 'actions',
        label: t('table.columns.actions'),
        width: ActionsColumnWidth,
        header: () => (
          <Column id="actions" width={ActionsColumnWidth}>
            {showToolbar ? (
              <BulkActions
                notifications={notifications}
                selectedNotifications={selectedNotifications}
                isUnread={isUnread}
                onSwitchReadStatus={onSwitchReadStatus}
                onSwitchSavedStatus={onSwitchSavedStatus}
                onMarkAllRead={onMarkAllRead}
              />
            ) : (
              <VisuallyHidden>{t('table.columns.actions')}</VisuallyHidden>
            )}
          </Column>
        ),
        cell: (notification: Notification) => (
          <Cell>
            <BulkActions
              notifications={[notification]}
              selectedNotifications={new Set([notification.id])}
              onSwitchReadStatus={onSwitchReadStatus}
              onSwitchSavedStatus={onSwitchSavedStatus}
            />
          </Cell>
        ),
      },
    ];
  }, [
    t,
    notifications,
    selectedNotifications,
    isUnread,
    onSwitchReadStatus,
    onSwitchSavedStatus,
    onMarkAllRead,
    onNotificationsSelectChange,
    markAsReadOnLinkOpen,
    highlightedNotificationId,
  ]);

  const pageSizeOptions = useMemo(
    () =>
      [...new Set([...DefaultPageSizeOptions, pageSize])]
        .sort((a, b) => a - b)
        .map(value => ({
          value,
          label: `${value} ${t('table.pagination.labelRowsSelect')}`,
        })),
    [pageSize, t],
  );

  const offset = page * pageSize;
  const hasNextPage =
    totalCount === undefined
      ? notifications.length >= pageSize
      : offset + pageSize < totalCount;

  const getPaginationLabel = useCallback(
    () =>
      t('table.pagination.labelDisplayedRows')
        .replace('{from}', String(offset + 1))
        .replace(
          '{to}',
          String(Math.min(offset + pageSize, totalCount ?? Infinity)),
        )
        .replace('{count}', String(totalCount ?? 0)),
    [t, offset, pageSize, totalCount],
  );

  return (
    <>
      <Flex direction="column" gap="2">
        <Flex justify="between" align="center" gap="4">
          {typeof title === 'string' ? (
            <Text as="h2" variant="title-x-small">
              {title}
            </Text>
          ) : (
            title ?? <div />
          )}
          <SearchField
            className={styles.search}
            size="small"
            aria-label={t('table.searchPlaceholder')}
            placeholder={t('table.searchPlaceholder')}
            onChange={throttledContainsTextHandler}
          />
        </Flex>
        <Table<Notification>
          columnConfig={compactColumns}
          data={isLoading && !notificationsProp ? undefined : notifications}
          isPending={isLoading}
          isStale={isLoading && !!notificationsProp}
          emptyState={t('table.emptyMessage')}
          pagination={{
            type: 'page',
            pageSize,
            pageSizeOptions,
            offset,
            totalCount,
            hasPreviousPage: page > 0,
            hasNextPage,
            onPreviousPage: () => onPageChange?.(page - 1, pageSize),
            onNextPage: () => onPageChange?.(page + 1, pageSize),
            onPageSizeChange: onRowsPerPageChange,
            getLabel: getPaginationLabel,
          }}
        />
      </Flex>
      <Dialog
        isOpen={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        isDismissable
      >
        <DialogHeader>{t('table.confirmDialog.title')}</DialogHeader>
        <DialogBody>
          <Text variant="body-medium">
            {t('table.confirmDialog.markAllReadDescription')}
          </Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" onPress={doMarkAllRead}>
            {t('table.confirmDialog.markAllReadConfirmation')}
          </Button>
          <Button variant="secondary" slot="close">
            {t('table.confirmDialog.cancel')}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
