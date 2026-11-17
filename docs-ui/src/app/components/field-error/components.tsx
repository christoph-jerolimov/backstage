'use client';

import { useState } from 'react';
import { FieldErrorContext } from 'react-aria-components';
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
    <FieldErrorContext.Provider
      value={{
        isInvalid: true,
        validationErrors: [],
        validationDetails: {} as ValidityState,
      }}
    >
      <div style={fieldStyle}>
        <input aria-invalid aria-label="Example" />
        <FieldError>This is an error message.</FieldError>
      </div>
    </FieldErrorContext.Provider>
  );
};

export const WithValidationErrors = () => {
  return (
    <FieldErrorContext.Provider
      value={{
        isInvalid: true,
        validationErrors: [
          'Must be at least 3 characters',
          'Must not contain spaces',
        ],
        validationDetails: {} as ValidityState,
      }}
    >
      <div style={fieldStyle}>
        <input aria-invalid aria-label="Example" defaultValue="a b" />
        <FieldError />
      </div>
    </FieldErrorContext.Provider>
  );
};

export const WithRenderProp = () => {
  return (
    <FieldErrorContext.Provider
      value={{
        isInvalid: true,
        validationErrors: [
          'Must be at least 3 characters',
          'Must not contain spaces',
        ],
        validationDetails: {} as ValidityState,
      }}
    >
      <div style={fieldStyle}>
        <input aria-invalid aria-label="Example" defaultValue="a b" />
        <FieldError>
          {({ validationErrors }) => (
            <ul style={{ margin: 0, paddingLeft: '1.25em' }}>
              {validationErrors.map(error => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </FieldError>
      </div>
    </FieldErrorContext.Provider>
  );
};

export const CustomField = () => {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const validationErrors =
    touched && value.length < 3 ? ['Must be at least 3 characters'] : [];

  return (
    <FieldErrorContext.Provider
      value={{
        isInvalid: validationErrors.length > 0,
        validationErrors,
        validationDetails: {} as ValidityState,
      }}
    >
      <div style={fieldStyle}>
        <FieldLabel
          label="Username"
          secondaryLabel="Required"
          description="At least 3 characters"
          htmlFor="username"
          descriptionId="username-description"
        />
        <input
          id="username"
          aria-describedby="username-description"
          aria-invalid={validationErrors.length > 0}
          value={value}
          onChange={event => {
            setTouched(true);
            setValue(event.target.value);
          }}
        />
        <FieldError />
      </div>
    </FieldErrorContext.Provider>
  );
};
