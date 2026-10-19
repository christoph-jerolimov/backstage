export const fieldErrorUsageSnippet = `import { FieldError } from '@backstage/ui';
import { TextField, Input } from 'react-aria-components';

<TextField isInvalid validationBehavior="aria">
  <Input />
  <FieldError>This field is invalid</FieldError>
</TextField>`;

export const defaultSnippet = `<TextField isInvalid validationBehavior="aria">
  <Input />
  <FieldError>This is an error message.</FieldError>
</TextField>`;

export const withServerValidationSnippet = `<Form validationErrors={{ email: 'This email is already taken.' }}>
  <TextField name="email">
    <Input />
    <FieldError />
  </TextField>
</Form>`;

export const withRenderPropSnippet = `<TextField
  isInvalid
  validationBehavior="aria"
  validate={() => 'This field is invalid'}
>
  <Input />
  <FieldError>
    {({ validationErrors }) =>
      validationErrors.length > 0 ? validationErrors[0] : 'Field is invalid'
    }
  </FieldError>
</TextField>`;

export const customFieldSnippet = `<TextField
  name="username"
  validationBehavior="aria"
  validate={value =>
    value.length < 3 ? 'Must be at least 3 characters' : null
  }
>
  <FieldLabel
    label="Username"
    secondaryLabel="Required"
    description="At least 3 characters"
    descriptionSlot="description"
  />
  <Input />
  <FieldError />
</TextField>`;
