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
import { useState } from 'react';
import {
  TextField,
  Input,
  Form,
  FieldErrorContext,
} from 'react-aria-components';
import { FieldError } from './FieldError';
import { FieldLabel } from '../FieldLabel';

const meta = preview.meta({
  title: 'Backstage UI/FieldError',
  component: FieldError,
});

// Show error with server validation using Form component
export const WithServerValidation = meta.story({
  render: () => (
    <Form validationErrors={{ demo: 'This is a server validation error.' }}>
      <TextField
        name="demo"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Input />
        <FieldError />
      </TextField>
    </Form>
  ),
});

// Show error using children
export const WithCustomMessage = meta.story({
  render: () => (
    <TextField
      isInvalid
      validationBehavior="aria"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Input />
      <FieldError>This is a custom error message.</FieldError>
    </TextField>
  ),
});

// Show error with render prop function
export const WithRenderProp = meta.story({
  render: () => (
    <TextField
      isInvalid
      validationBehavior="aria"
      validate={() => 'This field is invalid'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Input />
      <FieldError>
        {({ validationErrors }) =>
          validationErrors.length > 0 ? validationErrors[0] : 'Field is invalid'
        }
      </FieldError>
    </TextField>
  ),
});

// Build a custom field around a plain input by providing the validation
// context yourself
const CustomField = () => {
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          maxWidth: '300px',
        }}
      >
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

export const WithCustomField = meta.story({
  render: () => <CustomField />,
});
