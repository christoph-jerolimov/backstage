/*
 * Copyright 2025 The Backstage Authors
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
import preview from '../../../../../.storybook/preview';
import { TextField, Input } from 'react-aria-components';
import { FieldLabel } from './FieldLabel';

const meta = preview.meta({
  title: 'Backstage UI/FieldLabel',
  component: FieldLabel,
  argTypes: {
    label: {
      control: 'text',
    },
    secondaryLabel: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
  },
});

export const Default = meta.story({
  args: {
    label: 'Label',
  },
});

export const WithSecondaryLabel = meta.story({
  args: {
    ...Default.input.args,
    secondaryLabel: 'Secondary Label',
  },
});

export const WithDescription = meta.story({
  args: {
    ...Default.input.args,
    description: 'Description',
  },
});

export const WithAllFields = meta.story({
  args: {
    ...Default.input.args,
    secondaryLabel: 'Secondary Label',
    description: 'Description',
  },
});

export const WithCustomInput = meta.story({
  render: () => (
    <div>
      <FieldLabel
        label="Favorite color"
        description="Pick the color you like most"
        htmlFor="favorite-color"
        descriptionId="favorite-color-description"
      />
      <input
        id="favorite-color"
        type="color"
        aria-describedby="favorite-color-description"
      />
    </div>
  ),
});

export const WithReactAriaField = meta.story({
  render: () => (
    <TextField name="url" style={{ maxWidth: '300px' }}>
      <FieldLabel
        label="URL"
        secondaryLabel="Optional"
        description="The URL of your repository"
        descriptionSlot="description"
      />
      <Input placeholder="https://" />
    </TextField>
  ),
});
