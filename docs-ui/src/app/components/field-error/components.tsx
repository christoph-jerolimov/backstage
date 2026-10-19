'use client';

import { TextField, Input, Form } from 'react-aria-components';
import { FieldError } from '../../../../../packages/ui/src/components/FieldError/FieldError';
import { FieldLabel } from '../../../../../packages/ui/src/components/FieldLabel/FieldLabel';

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  maxWidth: '300px',
} as const;

export const Default = () => {
  return (
    <TextField isInvalid validationBehavior="aria" style={fieldStyle}>
      <Input />
      <FieldError>This is an error message.</FieldError>
    </TextField>
  );
};

export const WithServerValidation = () => {
  return (
    <Form validationErrors={{ email: 'This email is already taken.' }}>
      <TextField name="email" style={fieldStyle}>
        <Input />
        <FieldError />
      </TextField>
    </Form>
  );
};

export const WithRenderProp = () => {
  return (
    <TextField
      isInvalid
      validationBehavior="aria"
      validate={() => 'This field is invalid'}
      style={fieldStyle}
    >
      <Input />
      <FieldError>
        {({ validationErrors }) =>
          validationErrors.length > 0 ? validationErrors[0] : 'Field is invalid'
        }
      </FieldError>
    </TextField>
  );
};

export const CustomField = () => {
  return (
    <TextField
      name="username"
      validationBehavior="aria"
      validate={value =>
        value.length < 3 ? 'Must be at least 3 characters' : null
      }
      style={fieldStyle}
    >
      <FieldLabel
        label="Username"
        secondaryLabel="Required"
        description="At least 3 characters"
        descriptionSlot="description"
      />
      <Input />
      <FieldError />
    </TextField>
  );
};
