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

export const withReactAriaSnippet = `import { TextField, Input } from 'react-aria-components';

<TextField name="url">
  <FieldLabel
    label="URL"
    description="The URL of your repository"
    descriptionSlot="description"
  />
  <Input placeholder="https://" />
</TextField>`;
