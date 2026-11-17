export const fieldErrorUsageSnippet = `import { FieldError } from '@backstage/ui';
import { FieldErrorContext } from 'react-aria-components';

<FieldErrorContext.Provider
  value={{
    isInvalid: true,
    validationErrors: ['This field is invalid'],
    validationDetails: {} as ValidityState,
  }}
>
  <input aria-invalid />
  <FieldError />
</FieldErrorContext.Provider>`;

export const defaultSnippet = `<FieldErrorContext.Provider
  value={{
    isInvalid: true,
    validationErrors: [],
    validationDetails: {} as ValidityState,
  }}
>
  <input aria-invalid />
  <FieldError>This is an error message.</FieldError>
</FieldErrorContext.Provider>`;

export const withValidationErrorsSnippet = `<FieldErrorContext.Provider
  value={{
    isInvalid: true,
    validationErrors: ['Must be at least 3 characters', 'Must not contain spaces'],
    validationDetails: {} as ValidityState,
  }}
>
  <input aria-invalid defaultValue="a b" />
  <FieldError />
</FieldErrorContext.Provider>`;

export const withRenderPropSnippet = `<FieldErrorContext.Provider
  value={{
    isInvalid: true,
    validationErrors: ['Must be at least 3 characters', 'Must not contain spaces'],
    validationDetails: {} as ValidityState,
  }}
>
  <input aria-invalid defaultValue="a b" />
  <FieldError>
    {({ validationErrors }) => (
      <ul>
        {validationErrors.map(error => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    )}
  </FieldError>
</FieldErrorContext.Provider>`;

export const customFieldSnippet = `function UsernameField() {
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
    </FieldErrorContext.Provider>
  );
}`;
