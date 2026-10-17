'use client';

import { Combobox } from '../../../../../packages/ui/src/components/Combobox/Combobox';
import { Flex } from '../../../../../packages/ui/src/components/Flex/Flex';
import {
  RiCloudLine,
  RiCodeBoxLine,
  RiDatabase2Line,
  RiPlugLine,
  RiStackLine,
} from '@remixicon/react';

const fontOptions = [
  { id: 'sans', label: 'Sans-serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Monospace' },
  { id: 'cursive', label: 'Cursive' },
];

const countries = [
  { id: 'us', label: 'United States' },
  { id: 'ca', label: 'Canada' },
  { id: 'mx', label: 'Mexico' },
  { id: 'uk', label: 'United Kingdom' },
  { id: 'fr', label: 'France' },
  { id: 'de', label: 'Germany' },
  { id: 'it', label: 'Italy' },
  { id: 'es', label: 'Spain' },
  { id: 'jp', label: 'Japan' },
  { id: 'cn', label: 'China' },
  { id: 'in', label: 'India' },
  { id: 'br', label: 'Brazil' },
  { id: 'au', label: 'Australia' },
];

const sectionedFonts = [
  {
    title: 'Serif Fonts',
    options: [
      { id: 'times', label: 'Times New Roman' },
      { id: 'georgia', label: 'Georgia' },
      { id: 'garamond', label: 'Garamond' },
    ],
  },
  {
    title: 'Sans-Serif Fonts',
    options: [
      { id: 'arial', label: 'Arial' },
      { id: 'helvetica', label: 'Helvetica' },
      { id: 'verdana', label: 'Verdana' },
    ],
  },
  {
    title: 'Monospace Fonts',
    options: [
      { id: 'courier', label: 'Courier New' },
      { id: 'consolas', label: 'Consolas' },
      { id: 'fira', label: 'Fira Code' },
    ],
  },
];

const kindOptions = [
  { id: 'component', label: 'Component', icon: <RiCodeBoxLine />, value: 128 },
  { id: 'api', label: 'API', icon: <RiPlugLine />, value: 42 },
  { id: 'resource', label: 'Resource', icon: <RiDatabase2Line />, value: 17 },
  { id: 'system', label: 'System', icon: <RiStackLine />, value: 5 },
];

export const Preview = () => (
  <Combobox
    label="Font Family"
    options={fontOptions}
    placeholder="Pick a font"
    name="font"
    style={{ maxWidth: 260 }}
  />
);

export const WithLabelAndDescription = () => (
  <Combobox
    label="Font Family"
    description="Choose a font family for your document"
    options={fontOptions}
    placeholder="Pick a font"
    name="font"
    style={{ width: 300 }}
  />
);

export const Sizes = () => (
  <Flex direction="row" gap="2">
    <Combobox
      label="Small"
      size="small"
      options={fontOptions}
      name="font-small"
      placeholder="Pick a font"
      style={{ maxWidth: 260 }}
    />
    <Combobox
      label="Medium"
      size="medium"
      options={fontOptions}
      name="font-medium"
      placeholder="Pick a font"
      style={{ maxWidth: 260 }}
    />
  </Flex>
);

export const WithIcon = () => (
  <Combobox
    label="Font Family"
    options={fontOptions}
    placeholder="Pick a font"
    name="font"
    icon={<RiCloudLine />}
    style={{ width: 300 }}
  />
);

export const WithOptionIcons = () => (
  <Combobox
    label="Kind"
    options={kindOptions.map(({ value, ...option }) => option)}
    placeholder="Pick a kind"
    defaultValue="component"
    name="kind"
    style={{ width: 300 }}
  />
);

export const WithOptionValues = () => (
  <Combobox
    label="Kind"
    options={kindOptions}
    placeholder="Pick a kind"
    name="kind"
    style={{ width: 300 }}
  />
);

export const Disabled = () => (
  <Combobox
    label="Font Family"
    options={fontOptions}
    placeholder="Pick a font"
    name="font"
    isDisabled
    style={{ width: 300 }}
  />
);

export const AllowsCustomValue = () => (
  <Combobox
    label="Country"
    options={countries}
    placeholder="Type any country"
    allowsCustomValue
    name="country"
    style={{ width: 300 }}
  />
);

export const DisabledOption = () => (
  <Combobox
    label="Font Family"
    options={fontOptions}
    placeholder="Pick a font"
    name="font"
    disabledKeys={['serif']}
    style={{ width: 300 }}
  />
);

export const WithSections = () => (
  <Combobox
    label="Font Family"
    options={sectionedFonts}
    placeholder="Pick a font"
    name="font"
    style={{ width: 300 }}
  />
);
