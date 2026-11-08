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
  MouseEvent,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useApiHolder } from '@backstage/core-plugin-api';
import { isGroupEntity, isUserEntity } from '@backstage/catalog-model';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import {
  EntityCardActions,
  UserCardActions,
  GroupCardActions,
} from './CardActionComponents';
import { debounce } from 'lodash';
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

const useStyles = makeStyles(() => {
  return {
    // The popover root covers the whole screen while open, so it must not
    // capture pointer events. The paper re-enables them so that the content
    // can be hovered and interacted with.
    popover: {
      pointerEvents: 'none',
    },
    popoverPaper: {
      width: '30em',
      pointerEvents: 'auto',
    },
    descriptionTypography: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    },
  };
});

const maxTagChips = 4;
const popoverId = 'entity-peek-ahead';

/**
 * Shows an entity popover on hover of a component.
 *
 * @public
 */
export const EntityPeekAheadPopover = (props: EntityPeekAheadPopoverProps) => {
  const { entityRef, children, delayTime = 500 } = props;
  const { t } = useTranslationRef(catalogReactTranslationRef);
  const classes = useStyles();
  const apiHolder = useApiHolder();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = Boolean(anchorEl);

  const debouncedHandleMouseEnter = useMemo(
    () => debounce(() => setIsHovered(true), delayTime),
    [delayTime],
  );

  useEffect(
    () => () => debouncedHandleMouseEnter.cancel(),
    [debouncedHandleMouseEnter],
  );

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

  const handleTriggerMouseEnter = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    debouncedHandleMouseEnter();
  };

  const handleTriggerMouseLeave = (event: MouseEvent<HTMLElement>) => {
    // Keep the popover open while moving the pointer from the trigger into it
    if (
      event.relatedTarget instanceof Node &&
      popoverRef.current?.contains(event.relatedTarget)
    ) {
      return;
    }
    debouncedHandleMouseEnter.cancel();
    setIsHovered(false);
    setAnchorEl(null);
  };

  const handlePopoverMouseLeave = () => {
    debouncedHandleMouseEnter.cancel();
    setIsHovered(false);
    setAnchorEl(null);
  };

  useEffect(() => {
    if (isOpen && !entity && !error && !loading) {
      load();
    }
  }, [isOpen, load, entity, error, loading]);

  return (
    <>
      <Typography
        component="span"
        data-testid="trigger"
        aria-haspopup="true"
        aria-owns={isOpen ? popoverId : undefined}
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
      >
        {children}
      </Typography>
      {isHovered && (
        <Popover
          id={popoverId}
          ref={popoverRef}
          className={classes.popover}
          PaperProps={{
            className: classes.popoverPaper,
          }}
          open={isOpen}
          anchorEl={anchorEl}
          onClose={handlePopoverMouseLeave}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          onMouseLeave={handlePopoverMouseLeave}
          disableRestoreFocus
        >
          <Card>
            <CardContent>
              {error && <ResponseErrorPanel error={error} />}
              {loading && <Progress />}
              {entity && (
                <>
                  <Typography color="textSecondary">
                    {entity.metadata.namespace}
                  </Typography>
                  <Typography variant="h5" component="div">
                    {entity.metadata.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {entity.kind}
                  </Typography>
                  {entity.metadata.description && (
                    <Typography
                      className={classes.descriptionTypography}
                      paragraph
                    >
                      {entity.metadata.description}
                    </Typography>
                  )}
                  <Typography>{entity.spec?.type?.toString()}</Typography>
                  <Box marginTop="0.5em">
                    {(entity.metadata.tags || [])
                      .slice(0, maxTagChips)
                      .map(tag => {
                        return <Chip key={tag} size="small" label={tag} />;
                      })}
                    {entity.metadata.tags?.length &&
                      entity.metadata.tags?.length > maxTagChips && (
                        <Tooltip title={t('entityPeekAheadPopover.title')}>
                          <Chip key="other-tags" size="small" label="..." />
                        </Tooltip>
                      )}
                  </Box>
                </>
              )}
            </CardContent>
            {!error && entity && (
              <CardActions>
                <>
                  {isUserEntity(entity) && <UserCardActions entity={entity} />}
                  {isGroupEntity(entity) && (
                    <GroupCardActions entity={entity} />
                  )}
                  <EntityCardActions entity={entity} />
                </>
              </CardActions>
            )}
          </Card>
        </Popover>
      )}
    </>
  );
};
