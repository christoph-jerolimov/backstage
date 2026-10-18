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

import useAsyncFn from 'react-use/esm/useAsyncFn';
import { catalogApiRef } from '../../api';
import {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Flex,
  Link,
  Popover,
  Skeleton,
  Tag,
  TagGroup,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { useApiHolder, useRouteRef } from '@backstage/core-plugin-api';
import {
  getCompoundEntityRef,
  isGroupEntity,
  isUserEntity,
} from '@backstage/catalog-model';
import { entityRouteRef } from '../../routes';
import {
  EntityCardActions,
  UserCardActions,
  GroupCardActions,
} from './CardActionComponents';
import { catalogReactTranslationRef } from '../../translation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * Properties for an entity popover on hover of a component.
 *
 * @public
 */
export type EntityPeekAheadPopoverProps = PropsWithChildren<{
  entityRef: string;
  delayTime?: number;
}>;

const popoverStyle: CSSProperties = {
  width: '30em',
};

const descriptionStyle: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const maxTagChips = 4;

// Grace period that lets the pointer travel from the trigger into the popover
// without the popover closing in between.
const closeDelayTime = 150;

/**
 * Shows an entity popover on hover of a component.
 *
 * @public
 */
export const EntityPeekAheadPopover = (props: EntityPeekAheadPopoverProps) => {
  const { entityRef, children, delayTime = 500 } = props;
  const { t } = useTranslationRef(catalogReactTranslationRef);
  const apiHolder = useApiHolder();
  const entityRoute = useRouteRef(entityRouteRef);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const clearTimers = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  const handleMouseEnter = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setIsOpen(true), delayTime);
  };

  const handleMouseLeave = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setIsOpen(false), closeDelayTime);
  };

  useEffect(() => clearTimers, [clearTimers]);

  const [{ loading, error, value: entity }, load] = useAsyncFn(async () => {
    const catalogApi = apiHolder.get(catalogApiRef);
    if (catalogApi) {
      const retrievedEntity = await catalogApi.getEntityByRef(entityRef);
      if (!retrievedEntity) {
        throw new Error(`${entityRef} not found`);
      }
      return retrievedEntity;
    }
    return undefined;
  }, [apiHolder, entityRef]);

  useEffect(() => {
    if (isOpen && !entity && !error && !loading) {
      load();
    }
  }, [isOpen, load, entity, error, loading]);

  const tags = entity?.metadata.tags ?? [];
  const hiddenTagCount = Math.max(0, tags.length - maxTagChips);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      <Popover
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isNonModal
        placement="bottom"
        style={popoverStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {error && <Alert status="danger" description={error.message} />}
        {loading && (
          <Flex direction="column" gap="2">
            <Skeleton width="30%" height={16} />
            <Skeleton width="60%" height={24} />
            <Skeleton width="100%" height={16} />
          </Flex>
        )}
        {entity && (
          <Flex direction="column" gap="2">
            <Flex direction="column" gap="1">
              <Text variant="body-x-small" color="secondary">
                {entity.metadata.namespace}
              </Text>
              <Text as="div" variant="title-small">
                {entity.metadata.name}
              </Text>
              <Text variant="body-small" color="secondary">
                {entity.kind}
              </Text>
            </Flex>
            {entity.metadata.description && (
              <Text as="p" variant="body-medium" style={descriptionStyle}>
                {entity.metadata.description}
              </Text>
            )}
            {entity.spec?.type && (
              <Text variant="body-medium">{String(entity.spec.type)}</Text>
            )}
            {tags.length > 0 && (
              <Flex align="center" gap="1">
                <TagGroup aria-label={t('entityPeekAheadPopover.tagsLabel')}>
                  {tags.slice(0, maxTagChips).map(tag => (
                    <Tag key={tag} size="small">
                      {tag}
                    </Tag>
                  ))}
                </TagGroup>
                {hiddenTagCount > 0 && (
                  <TooltipTrigger>
                    <Link
                      href={entityRoute(getCompoundEntityRef(entity))}
                      variant="body-x-small"
                      color="secondary"
                    >
                      +{hiddenTagCount}
                    </Link>
                    <Tooltip>{t('entityPeekAheadPopover.title')}</Tooltip>
                  </TooltipTrigger>
                )}
              </Flex>
            )}
            <Flex justify="end" gap="1">
              {isUserEntity(entity) && <UserCardActions entity={entity} />}
              {isGroupEntity(entity) && <GroupCardActions entity={entity} />}
              <EntityCardActions entity={entity} />
            </Flex>
          </Flex>
        )}
      </Popover>
    </>
  );
};
