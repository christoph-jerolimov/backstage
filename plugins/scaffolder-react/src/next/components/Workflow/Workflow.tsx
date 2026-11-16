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

import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  Content,
  InfoCard,
  MarkdownContent,
  Progress,
} from '@backstage/core-components';
import { errorApiRef, useAnalytics, useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { ReviewStepProps } from '@backstage/plugin-scaffolder-react';
import { JsonValue } from '@backstage/types';
import { makeStyles } from '@material-ui/core/styles';
import { ComponentType, useCallback, useEffect } from 'react';

import { SecretsContextProvider } from '../../../secrets/SecretsContext';
import { scaffolderReactTranslationRef } from '../../../translation';
import { useFilteredSchemaProperties } from '../../hooks/useFilteredSchemaProperties';
import { useTemplateParameterSchema } from '../../hooks/useTemplateParameterSchema';
import { useTemplateTimeSavedMinutes } from '../../hooks/useTemplateTimeSaved';
import { Stepper, type StepperProps } from '../Stepper/Stepper';
import {
  DescriptionLayoutMenu,
  useDescriptionLayout,
} from './DescriptionLayoutMenu';

const useStyles = makeStyles(theme => ({
  markdown: {
    overflowWrap: 'anywhere',
    /** to make the styles for React Markdown not leak into the description */
    '& :first-child': {
      marginTop: 0,
    },
    '& :last-child': {
      marginBottom: 0,
    },
  },
  sideLayout: {
    display: 'flex',
    alignItems: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      alignItems: 'stretch',
    },
  },
  sideForm: {
    flex: '4 1 0',
    minWidth: 0,
  },
  sideDescription: {
    flex: '1 1 0',
    minWidth: 0,
    padding: theme.spacing(3),
    color: theme.palette.text.secondary,
    borderLeft: `1px solid ${theme.palette.divider}`,
    alignSelf: 'stretch',
    [theme.breakpoints.down('sm')]: {
      borderLeft: 'none',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
}));

/**
 * @alpha
 */
export type WorkflowProps = {
  title?: string;
  description?: string;
  namespace: string;
  templateName: string;
  components?: {
    ReviewStepComponent?: ComponentType<ReviewStepProps>;
  };
  onError(error: Error | undefined): JSX.Element | null;
} & Pick<
  StepperProps,
  | 'extensions'
  | 'formProps'
  | 'components'
  | 'onCreate'
  | 'initialState'
  | 'layouts'
>;

/**
 * @alpha
 */
export const Workflow = (workflowProps: WorkflowProps): JSX.Element | null => {
  const { t } = useTranslationRef(scaffolderReactTranslationRef);
  const { title, description, namespace, templateName, onCreate, ...props } =
    workflowProps;

  const analytics = useAnalytics();
  const styles = useStyles();
  const [descriptionLayout, setDescriptionLayout] = useDescriptionLayout();
  const templateRef = stringifyEntityRef({
    kind: 'Template',
    namespace: namespace,
    name: templateName,
  });

  const errorApi = useApi(errorApiRef);

  const { loading, manifest, error } = useTemplateParameterSchema(templateRef);

  const sortedManifest = useFilteredSchemaProperties(manifest);

  const minutesSaved = useTemplateTimeSavedMinutes(templateRef);

  const workflowOnCreate = useCallback(
    async (formState: Record<string, JsonValue>) => {
      await onCreate(formState);

      analytics.captureEvent('create', 'Task has been created', {
        value: minutesSaved,
        attributes: {
          templateSteps: sortedManifest?.steps?.length ?? 0,
        },
      });
    },
    [onCreate, analytics, minutesSaved, sortedManifest],
  );

  useEffect(() => {
    if (error) {
      errorApi.post(new Error(`Failed to load template, ${error}`));
    }
  }, [error, errorApi]);

  if (error) {
    return props.onError(error);
  }

  const stepper = sortedManifest && (
    <Stepper manifest={sortedManifest} onCreate={workflowOnCreate} {...props} />
  );

  const descriptionContent = sortedManifest && (
    <MarkdownContent
      className={styles.markdown}
      linkTarget="_blank"
      content={
        description ?? sortedManifest.description ?? t('workflow.noDescription')
      }
    />
  );

  return (
    <Content>
      {loading && <Progress />}
      {sortedManifest && (
        <InfoCard
          title={title ?? sortedManifest.title}
          subheader={
            descriptionLayout === 'above' ? descriptionContent : undefined
          }
          action={
            <DescriptionLayoutMenu
              layout={descriptionLayout}
              onChange={setDescriptionLayout}
            />
          }
          noPadding
          titleTypographyProps={{ component: 'h2' }}
        >
          {/* The form keeps its position in the tree so that its state is preserved when the layout changes */}
          <div
            className={
              descriptionLayout === 'side' ? styles.sideLayout : undefined
            }
          >
            <div className={styles.sideForm}>{stepper}</div>
            {descriptionLayout === 'side' && (
              <aside className={styles.sideDescription}>
                {descriptionContent}
              </aside>
            )}
          </div>
        </InfoCard>
      )}
    </Content>
  );
};

/**
 * @alpha
 */
export const EmbeddableWorkflow = (props: WorkflowProps) => (
  <SecretsContextProvider>
    <Workflow {...props} />
  </SecretsContextProvider>
);
