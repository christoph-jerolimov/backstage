export const fieldLabelUsageSnippet = `import { FieldLabel } from '@backstage/ui';

<FieldLabel label="Label" description="Description" />`;

export const defaultSnippet = `<FieldLabel label="Label" />`;

export const withSecondaryLabelSnippet = `<FieldLabel label="Label" secondaryLabel="Required" />`;

export const withDescriptionSnippet = `<FieldLabel
  label="Label"
  secondaryLabel="Optional"
  description="Description"
/>`;

export const customFieldSnippet = `<div>
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
</div>`;

export const withLabelledBySnippet = `<div>
  <FieldLabel id="volume-label" label="Volume" />
  <input
    type="range"
    min={0}
    max={100}
    aria-labelledby="volume-label"
  />
</div>`;
