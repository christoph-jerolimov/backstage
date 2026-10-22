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

import { Button, Flex } from '@backstage/ui';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

import { useSearch } from '../../context';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { searchReactTranslationRef } from '../../translation';

/**
 * @public
 */
export const SearchResultPager = () => {
  const { fetchNextPage, fetchPreviousPage } = useSearch();
  const { t } = useTranslationRef(searchReactTranslationRef);

  if (!fetchNextPage && !fetchPreviousPage) {
    return <></>;
  }

  return (
    <Flex
      role="navigation"
      aria-label="pagination navigation"
      justify="between"
      gap="4"
      my="4"
      grow
    >
      <Button
        aria-label="previous page"
        variant="secondary"
        isDisabled={!fetchPreviousPage}
        onPress={fetchPreviousPage}
        iconStart={<RiArrowLeftSLine />}
      >
        {t('searchResultPager.previous')}
      </Button>

      <Button
        aria-label="next page"
        variant="secondary"
        isDisabled={!fetchNextPage}
        onPress={fetchNextPage}
        iconEnd={<RiArrowRightSLine />}
      >
        {t('searchResultPager.next')}
      </Button>
    </Flex>
  );
};
