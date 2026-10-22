/*
 * Copyright 2021 The Backstage Authors
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
import { useContent } from '@backstage/core-components';
import {
  SearchContextProvider,
  SearchResult,
  searchReactTranslationRef,
  useSearch,
} from '@backstage/plugin-search-react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Flex,
  SearchField,
} from '@backstage/ui';
import { configApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
} from '@remixicon/react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import useDebounce from 'react-use/esm/useDebounce';
import { useNavigate } from 'react-router-dom';

import { rootRouteRef } from '../../plugin';
import { SearchResultSet } from '@backstage/plugin-search-common';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { searchTranslationRef } from '../../translation';

/**
 * @public
 */
export interface SearchModalChildrenProps {
  /**
   * A function that should be invoked when navigating away from the modal.
   */
  toggleModal: () => void;

  /**
   * Ability to provide custom components to render the result items
   */
  resultItemComponents?:
    | ReactNode
    | ((resultSet: SearchResultSet) => JSX.Element);
}

/**
 * @public
 */
export interface SearchModalProps {
  /**
   * If true, it renders the modal.
   */
  open?: boolean;
  /**
   * This is supposed to be used together with the open prop.
   * If `hidden` is true, it hides the modal.
   * If `open` is false, the value of `hidden` has no effect on the modal.
   * Use `open` for controlling whether the modal should be rendered or not.
   */
  hidden?: boolean;
  /**
   * a function invoked when a search item is pressed or when the dialog
   * should be closed.
   */
  toggleModal: () => void;
  /**
   * A function that returns custom content to render in the search modal in
   * place of the default.
   */
  children?: (props: SearchModalChildrenProps) => JSX.Element;

  /**
   * Optional ability to pass in result item component renderers.
   */
  resultItemComponents?: SearchModalChildrenProps['resultItemComponents'];
}

const useStyles = makeStyles({
  // Places the previous and next buttons at opposite ends of the footer.
  footer: { justifyContent: 'space-between' },
});

// Matches the default debounce time of the search bar from the search React library.
const SEARCH_DEBOUNCE_TIME = 200;

export const Modal = ({ resultItemComponents }: SearchModalChildrenProps) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const configApi = useApi(configApiRef);
  const { transitions } = useTheme();
  const { focusContent } = useContent();
  const { term, setTerm, fetchNextPage, fetchPreviousPage } = useSearch();
  const { t } = useTranslationRef(searchTranslationRef);
  const { t: tSearchReact } = useTranslationRef(searchReactTranslationRef);

  const searchRootRoute = useRouteRef(rootRouteRef)();

  // The field value is kept locally and only forwarded to the search context
  // after a debounce, to avoid firing a search request on every keystroke.
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
      setTerm(value);
    },
    SEARCH_DEBOUNCE_TIME,
    [value],
  );

  const handleSearchResultClick = useCallback(() => {
    setTimeout(focusContent, transitions.duration.leavingScreen);
  }, [focusContent, transitions]);

  // Navigates to the full search results page, using the current field value
  // without waiting for the query debounce.
  const handleSubmit = useCallback(
    (query: string) => {
      navigate(`${searchRootRoute}?query=${query}`);
      handleSearchResultClick();
    },
    [navigate, handleSearchResultClick, searchRootRoute],
  );

  return (
    <>
      <DialogHeader>{t('searchModal.title')}</DialogHeader>
      <DialogBody>
        <SearchField
          // The search field is the primary interaction of the modal and
          // should receive focus as soon as the modal is opened.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          aria-label={tSearchReact('searchBar.title')}
          placeholder={tSearchReact('searchBar.placeholder', {
            org: configApi.getOptionalString('app.title') || 'Backstage',
          })}
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
        />
        <Flex justify="end">
          <Button
            variant="tertiary"
            iconEnd={<RiArrowRightLine />}
            onPress={() => handleSubmit(value)}
          >
            {t('searchModal.viewFullResults')}
          </Button>
        </Flex>
        <SearchResult
          onClick={handleSearchResultClick}
          onKeyDown={handleSearchResultClick}
        >
          {resultItemComponents}
        </SearchResult>
      </DialogBody>
      {(fetchNextPage || fetchPreviousPage) && (
        <DialogFooter className={classes.footer}>
          <Button
            variant="secondary"
            iconStart={<RiArrowLeftSLine />}
            isDisabled={!fetchPreviousPage}
            onPress={fetchPreviousPage}
          >
            {tSearchReact('searchResultPager.previous')}
          </Button>
          <Button
            variant="secondary"
            iconEnd={<RiArrowRightSLine />}
            isDisabled={!fetchNextPage}
            onPress={fetchNextPage}
          >
            {tSearchReact('searchResultPager.next')}
          </Button>
        </DialogFooter>
      )}
    </>
  );
};

/**
 * @public
 */
export const SearchModal = (props: SearchModalProps) => {
  const {
    open = true,
    hidden,
    toggleModal,
    children,
    resultItemComponents,
  } = props;

  const modalRef = useRef<HTMLDivElement>(null);

  const isDialogOpen = open && !hidden;

  return (
    <Dialog
      ref={modalRef}
      isOpen={isDialogOpen}
      onOpenChange={isOpen => !isOpen && toggleModal()}
      // Custom modal content may render Material UI menus and popovers, which
      // are rendered outside of the dialog. Only interactions with the dialog
      // backdrop should close the modal, so that those keep working.
      shouldCloseOnInteractOutside={element =>
        modalRef.current?.parentElement?.contains(element) ?? true
      }
      width={1280}
      // Reduces the default height of the modal, keeping a gap of 64px
      // between the modal and the top and bottom of the page.
      height="calc(100vh - 128px)"
    >
      {isDialogOpen && (
        <SearchContextProvider inheritParentContextIfAvailable>
          {(children &&
            children({
              toggleModal,
              resultItemComponents: resultItemComponents || [],
            })) ?? (
            <Modal
              toggleModal={toggleModal}
              resultItemComponents={resultItemComponents}
            />
          )}
        </SearchContextProvider>
      )}
    </Dialog>
  );
};
