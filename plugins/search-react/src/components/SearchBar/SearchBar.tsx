/*
 * Copyright 2022 The Backstage Authors
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

import {
  AnalyticsContext,
  configApiRef,
  useApi,
  useApp,
} from '@backstage/core-plugin-api';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { TextFieldProps } from '@material-ui/core/TextField';
import DefaultSearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import { SearchField, SearchFieldDefinition } from '@backstage/ui';
import {
  ReactNode,
  ChangeEvent,
  forwardRef,
  KeyboardEvent,
  MutableRefObject,
  Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import useDebounce from 'react-use/esm/useDebounce';
import { SearchContextProvider, useSearch } from '../../context';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { searchReactTranslationRef } from '../../translation';

/**
 * Props for {@link SearchBarBase}.
 *
 * @public
 */
export type SearchBarBaseProps = Omit<TextFieldProps, 'onChange'> & {
  debounceTime?: number;
  clearButton?: boolean;
  onClear?: () => void;
  onSubmit?: () => void;
  onChange: (value: string) => void;
  endAdornment?: ReactNode;
};

/**
 * A search box based on the <TextField /> component from Material UI, which is
 * not connected to the Search Context.
 * Recommended if you don't use Search Provider or Search Context, or if you
 * need to pass Material UI specific props to the search box.
 *
 * @public
 */
export const SearchBarBase = forwardRef((props: SearchBarBaseProps, ref) => {
  const {
    onChange,
    onKeyDown = () => {},
    onClear = () => {},
    onSubmit = () => {},
    debounceTime = 200,
    clearButton = true,
    fullWidth = true,
    value: defaultValue,
    label,
    placeholder,
    inputProps = {},
    InputProps = {},
    endAdornment,
    ...rest
  } = props;

  const configApi = useApi(configApiRef);
  const [value, setValue] = useState<string>('');
  const forwardedValueRef = useRef<string>('');
  const { t } = useTranslationRef(searchReactTranslationRef);

  useEffect(() => {
    setValue(prevValue => {
      // We only update the value if our current value is the same as it was
      // for the most recent onChange call. Otherwise it means that the users
      // has continued typing and we should not replace their input.
      if (prevValue === forwardedValueRef.current) {
        return String(defaultValue);
      }
      return prevValue;
    });
  }, [defaultValue, forwardedValueRef]);

  useDebounce(
    () => {
      forwardedValueRef.current = value;
      onChange(value);
    },
    debounceTime,
    [value],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (onKeyDown) onKeyDown(e);
      if (onSubmit && e.key === 'Enter') {
        onSubmit();
      }
    },
    [onKeyDown, onSubmit],
  );

  const handleClear = useCallback(() => {
    forwardedValueRef.current = '';
    onChange('');
    setValue('');
    if (onClear) {
      onClear();
    }
  }, [onChange, onClear]);

  const ariaLabel: string | undefined = label
    ? undefined
    : t('searchBar.title');

  const inputPlaceholder =
    placeholder ??
    t('searchBar.placeholder', {
      org: configApi.getOptionalString('app.title') || 'Backstage',
    });
  const SearchIcon = useApp().getSystemIcon('search') || DefaultSearchIcon;

  const startAdornment = (
    <InputAdornment position="start">
      <IconButton aria-label="Query" size="small" disabled>
        <SearchIcon />
      </IconButton>
    </InputAdornment>
  );

  const clearButtonEndAdornment = (
    <InputAdornment position="end">
      <Button
        aria-label={t('searchBar.clearButtonTitle')}
        size="small"
        onClick={handleClear}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            // write your functionality here
            event.stopPropagation();
          }
        }}
      >
        {t('searchBar.clearButtonTitle')}
      </Button>
    </InputAdornment>
  );

  return (
    <SearchContextProvider inheritParentContextIfAvailable>
      <TextField
        id="search-bar-text-field"
        data-testid="search-bar-next"
        variant="outlined"
        margin="normal"
        inputRef={ref}
        value={value}
        label={label}
        placeholder={inputPlaceholder}
        InputProps={{
          startAdornment,
          endAdornment: clearButton ? clearButtonEndAdornment : endAdornment,
          ...InputProps,
        }}
        inputProps={{
          'aria-label': ariaLabel,
          ...inputProps,
        }}
        fullWidth={fullWidth}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    </SearchContextProvider>
  );
});

/**
 * Props for {@link SearchBar}.
 *
 * @public
 */
export type SearchBarProps = Partial<SearchBarBaseProps>;

const useSearchBarStyles = makeStyles({
  withoutClearButton: {
    [`& .${SearchFieldDefinition.classNames.clear}`]: {
      display: 'none',
    },
  },
});

function setRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    (ref as MutableRefObject<T>).current = value;
  }
}

/**
 * Recommended search bar when you use the Search Provider or Search Context.
 *
 * @remarks
 * This search bar renders the Backstage UI search field. Material UI specific
 * props, such as `InputProps`, `variant` or `endAdornment`, are not applied.
 * Use {@link SearchBarBase} if you need a Material UI based search box.
 *
 * @public
 */
export const SearchBar = forwardRef((props: SearchBarProps, ref) => {
  const {
    value: initialValue = '',
    onChange,
    onClear,
    onSubmit,
    debounceTime = 200,
    clearButton = true,
    label,
    placeholder,
    className,
    autoFocus,
    disabled,
    inputProps,
  } = props;

  const classes = useSearchBarStyles();
  const configApi = useApi(configApiRef);
  const { term, setTerm } = useSearch();
  const { t } = useTranslationRef(searchReactTranslationRef);
  const SearchIcon = useApp().getSystemIcon('search');

  useEffect(() => {
    if (initialValue) {
      setTerm(String(initialValue));
    }
  }, [initialValue, setTerm]);

  const handleChange = useCallback(
    (newValue: string) => {
      if (onChange) {
        onChange(newValue);
      } else {
        setTerm(newValue);
      }
    },
    [onChange, setTerm],
  );

  // The field value is kept locally and only forwarded after a debounce, to
  // avoid firing a search request on every keystroke.
  const [value, setValue] = useState(term);
  const forwardedValueRef = useRef(term);

  useEffect(() => {
    setValue(prevValue => {
      // Only pick up term changes from the search context if the user has not
      // continued typing since the value was last forwarded.
      if (prevValue === forwardedValueRef.current) {
        return term;
      }
      return prevValue;
    });
  }, [term]);

  useDebounce(
    () => {
      forwardedValueRef.current = value;
      handleChange(value);
    },
    debounceTime,
    [value],
  );

  const handleClear = useCallback(() => {
    forwardedValueRef.current = '';
    handleChange('');
    setValue('');
    if (onClear) {
      onClear();
    }
  }, [handleChange, onClear]);

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  // Exposes the input element through the forwarded ref and `inputProps.ref`,
  // for example to read the current value without waiting for the debounce.
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = inputProps?.ref;
  useLayoutEffect(() => {
    const input = rootRef.current?.querySelector('input') ?? null;
    setRef(ref, input);
    setRef(inputRef, input);
  });

  const labelText = typeof label === 'string' ? label : undefined;

  const inputPlaceholder =
    placeholder ??
    t('searchBar.placeholder', {
      org: configApi.getOptionalString('app.title') || 'Backstage',
    });

  const classNames = [className, !clearButton && classes.withoutClearButton]
    .filter(Boolean)
    .join(' ');

  return (
    <SearchContextProvider inheritParentContextIfAvailable>
      <AnalyticsContext
        attributes={{ pluginId: 'search', extension: 'SearchBar' }}
      >
        <SearchField
          ref={rootRef}
          id="search-bar-text-field"
          data-testid="search-bar-next"
          className={classNames || undefined}
          label={labelText}
          aria-label={labelText ? undefined : t('searchBar.title')}
          placeholder={inputPlaceholder}
          icon={SearchIcon ? <SearchIcon /> : undefined}
          value={value}
          isDisabled={disabled}
          // decision up to adopter, read https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-autofocus.md#no-autofocus
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          onChange={setValue}
          onClear={handleClear}
          onSubmit={handleSubmit}
        />
      </AnalyticsContext>
    </SearchContextProvider>
  );
});
