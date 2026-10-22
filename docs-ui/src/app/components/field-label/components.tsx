'use client';

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

export const WithLabelledBy = () => {
  return (
    <div>
      <FieldLabel id="volume-label" label="Volume" />
      <input type="range" min={0} max={100} aria-labelledby="volume-label" />
    </div>
  );
};
