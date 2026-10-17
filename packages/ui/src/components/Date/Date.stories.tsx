/*
 * Copyright 2026 The Backstage Authors
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
import { I18nProvider } from 'react-aria-components';
import { Date as BUIDate } from './Date';
import { Flex, Text } from '../..';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const meta = preview.meta({
  title: 'Backstage UI/Date',
  component: BUIDate,
  argTypes: {
    value: { control: 'date' },
    relative: { control: 'boolean' },
    tooltip: {
      control: 'select',
      options: ['absolute', 'input', 'none'],
    },
  },
  args: {
    value: Date.now() - 3 * HOUR,
    relative: true,
    tooltip: 'absolute',
  },
});

export const Default = meta.story({});

const offsets: Array<[string, number]> = [
  ['30 seconds ago', -30 * 1000],
  ['5 minutes ago', -5 * MINUTE],
  ['3 hours ago', -3 * HOUR],
  ['1 day ago', -DAY],
  ['3 days ago', -3 * DAY],
  ['10 days ago', -10 * DAY],
  ['1 year ago', -365 * DAY],
  ['in 2 hours', 2 * HOUR],
  ['in 1 day', DAY],
  ['in 10 days', 10 * DAY],
];

export const Relative = meta.story({
  render: args => (
    <Flex direction="column" gap="2">
      {offsets.map(([label, offset]) => (
        <Flex key={label} gap="4" align="center">
          <Text style={{ width: 120 }} color="secondary">
            {label}
          </Text>
          <BUIDate {...args} value={Date.now() + offset} />
        </Flex>
      ))}
    </Flex>
  ),
});

export const Absolute = meta.story({
  args: {
    ...Relative.input.args,
    relative: false,
  },
  render: Relative.input.render,
});

export const InputTypes = meta.story({
  render: args => (
    <Flex direction="column" gap="2">
      <Flex gap="4" align="center">
        <Text style={{ width: 120 }} color="secondary">
          Date object
        </Text>
        <BUIDate {...args} value={new Date(Date.now() - 3 * HOUR)} />
      </Flex>
      <Flex gap="4" align="center">
        <Text style={{ width: 120 }} color="secondary">
          ISO string
        </Text>
        <BUIDate {...args} value="2024-05-21T14:30:00Z" />
      </Flex>
      <Flex gap="4" align="center">
        <Text style={{ width: 120 }} color="secondary">
          Timestamp
        </Text>
        <BUIDate {...args} value={1716301800000} />
      </Flex>
      <Flex gap="4" align="center">
        <Text style={{ width: 120 }} color="secondary">
          Invalid
        </Text>
        <BUIDate {...args} value="not a date" />
      </Flex>
    </Flex>
  ),
});

export const Tooltips = meta.story({
  args: {
    value: '2024-05-21T14:30:00Z',
  },
  render: args => (
    <Flex direction="column" gap="2">
      <Flex gap="4" align="center">
        <Text style={{ width: 120 }} color="secondary">
          absolute
        </Text>
        <BUIDate {...args} tooltip="absolute" />
      </Flex>
      <Flex gap="4" align="center">
        <Text style={{ width: 120 }} color="secondary">
          input
        </Text>
        <BUIDate {...args} tooltip="input" />
      </Flex>
      <Flex gap="4" align="center">
        <Text style={{ width: 120 }} color="secondary">
          none
        </Text>
        <BUIDate {...args} tooltip="none" />
      </Flex>
    </Flex>
  ),
});

export const FormatOptions = meta.story({
  args: {
    value: '2024-05-21T14:30:00Z',
    relative: false,
  },
  render: args => (
    <Flex direction="column" gap="2">
      <BUIDate {...args} />
      <BUIDate {...args} formatOptions={{ dateStyle: 'full' }} />
      <BUIDate {...args} formatOptions={{ dateStyle: 'short' }} />
      <BUIDate {...args} formatOptions={{ timeStyle: 'short' }} />
      <BUIDate
        {...args}
        formatOptions={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />
    </Flex>
  ),
});

const locales = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'ar-EG'];

export const Localized = meta.story({
  render: args => (
    <Flex direction="column" gap="2">
      {locales.map(locale => (
        <Flex key={locale} gap="4" align="center">
          <Text style={{ width: 120 }} color="secondary">
            {locale}
          </Text>
          <I18nProvider locale={locale}>
            <BUIDate {...args} />
            <BUIDate {...args} relative={false} />
          </I18nProvider>
        </Flex>
      ))}
    </Flex>
  ),
});
