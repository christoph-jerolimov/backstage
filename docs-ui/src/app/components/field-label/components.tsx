'use client';

import { TextField, Input } from 'react-aria-components';
import { FieldLabel } from '../../../../../packages/ui/src/components/FieldLabel/FieldLabel';

export const Default = () => {
  return <FieldLabel label="Label" />;
};

export const WithSecondaryLabel = () => {
  return <FieldLabel label="Label" secondaryLabel="Required" />;
};

export const WithDescription = () => {
  return (
    <FieldLabel
      label="Label"
      secondaryLabel="Optional"
      description="Description"
    />
  );
};

export const CustomField = () => {
  return (
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
  );
};

export const WithReactAria = () => {
  return (
    <TextField name="url" style={{ maxWidth: '300px' }}>
      <FieldLabel
        label="URL"
        description="The URL of your repository"
        descriptionSlot="description"
      />
      <Input placeholder="https://" />
    </TextField>
  );
};
