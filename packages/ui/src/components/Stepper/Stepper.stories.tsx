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

import { useState } from 'react';
import preview from '../../../../../.storybook/preview';
import type { Key } from 'react-aria-components';
import {
  Stepper,
  StepList,
  Step,
  StepPanel,
  StepperPreviousButton,
  StepperNextButton,
} from './Stepper';
import { useStepper } from './StepperContext';
import { Button } from '../Button';
import { Flex } from '../Flex';
import { Text } from '../Text';
import { TextField } from '../TextField';
import { Select } from '../Select';

const meta = preview.meta({
  title: 'Backstage UI/Stepper',
  component: Stepper,
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    isReadOnly: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
});

const Navigation = () => (
  <Flex justify="end" gap="2">
    <StepperPreviousButton />
    <StepperNextButton />
  </Flex>
);

const DetailsForm = () => (
  <Flex direction="column" gap="4">
    <TextField label="Name" placeholder="my-service" />
    <TextField label="Description" placeholder="What does it do?" />
  </Flex>
);

const OwnerForm = () => (
  <Flex direction="column" gap="4">
    <Select
      label="Owner"
      options={[
        { value: 'team-a', label: 'Team A' },
        { value: 'team-b', label: 'Team B' },
      ]}
    />
    <Select
      label="Lifecycle"
      options={[
        { value: 'experimental', label: 'Experimental' },
        { value: 'production', label: 'Production' },
      ]}
    />
  </Flex>
);

const Review = () => (
  <Text>Review the information above and press Create to finish.</Text>
);

export const Default = meta.story({
  args: {
    orientation: 'horizontal',
  },
  render: args => (
    <Stepper {...args}>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" />
        <Step id="owner" title="Owner" />
        <Step id="review" title="Review" />
      </StepList>
      <StepPanel id="details">
        <DetailsForm />
      </StepPanel>
      <StepPanel id="owner">
        <OwnerForm />
      </StepPanel>
      <StepPanel id="review">
        <Review />
      </StepPanel>
      <Navigation />
    </Stepper>
  ),
});

export const WithDescriptions = meta.story({
  args: {
    orientation: 'horizontal',
  },
  render: args => (
    <Stepper {...args}>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" description="Name and summary" />
        <Step id="owner" title="Owner" description="Team and lifecycle" />
        <Step id="review" title="Review" description="Check and create" />
      </StepList>
      <StepPanel id="details">
        <DetailsForm />
      </StepPanel>
      <StepPanel id="owner">
        <OwnerForm />
      </StepPanel>
      <StepPanel id="review">
        <Review />
      </StepPanel>
      <Navigation />
    </Stepper>
  ),
});

export const Vertical = meta.story({
  args: {
    orientation: 'vertical',
  },
  render: args => (
    <Stepper {...args}>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" description="Name and summary" />
        <Step id="owner" title="Owner" description="Team and lifecycle" />
        <Step id="review" title="Review" description="Check and create" />
      </StepList>
      <Flex direction="column" gap="4" style={{ flex: 1 }}>
        <StepPanel id="details">
          <DetailsForm />
        </StepPanel>
        <StepPanel id="owner">
          <OwnerForm />
        </StepPanel>
        <StepPanel id="review">
          <Review />
        </StepPanel>
        <Navigation />
      </Flex>
    </Stepper>
  ),
});

export const ReadOnly = meta.story({
  args: {
    isReadOnly: true,
  },
  render: args => (
    <Stepper {...args}>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" />
        <Step id="owner" title="Owner" />
        <Step id="review" title="Review" />
      </StepList>
      <StepPanel id="details">
        <DetailsForm />
      </StepPanel>
      <StepPanel id="owner">
        <OwnerForm />
      </StepPanel>
      <StepPanel id="review">
        <Review />
      </StepPanel>
      <Navigation />
    </Stepper>
  ),
});

export const DisabledStep = meta.story({
  render: args => (
    <Stepper {...args}>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" />
        <Step id="owner" title="Owner" isDisabled />
        <Step id="review" title="Review" />
      </StepList>
      <StepPanel id="details">
        <DetailsForm />
      </StepPanel>
      <StepPanel id="owner">
        <OwnerForm />
      </StepPanel>
      <StepPanel id="review">
        <Review />
      </StepPanel>
      <Navigation />
    </Stepper>
  ),
});

const SubmitOrNext = () => {
  const { isLastStep } = useStepper();
  return isLastStep ? (
    <Button onPress={() => alert('Created!')}>Create</Button>
  ) : (
    <StepperNextButton />
  );
};

const Progress = () => {
  const { selectedIndex, stepKeys } = useStepper();
  return (
    <Text color="secondary">
      Step {selectedIndex + 1} of {stepKeys.length}
    </Text>
  );
};

export const Controlled = meta.story({
  render: args => {
    const [step, setStep] = useState<Key>('details');
    return (
      <Stepper {...args} selectedKey={step} onSelectionChange={setStep}>
        <StepList aria-label="Create component">
          <Step id="details" title="Details" />
          <Step id="owner" title="Owner" />
          <Step id="review" title="Review" />
        </StepList>
        <StepPanel id="details" shouldForceMount>
          <DetailsForm />
        </StepPanel>
        <StepPanel id="owner" shouldForceMount>
          <OwnerForm />
        </StepPanel>
        <StepPanel id="review">
          <Review />
        </StepPanel>
        <Flex justify="between" align="center" gap="2">
          <Progress />
          <Flex gap="2">
            <StepperPreviousButton />
            <SubmitOrNext />
          </Flex>
        </Flex>
      </Stepper>
    );
  },
});

export const CustomStepContent = meta.story({
  render: args => (
    <Stepper {...args}>
      <StepList aria-label="Create component">
        <Step id="details">
          <Text as="span" weight="bold">
            1. Details
          </Text>
        </Step>
        <Step id="owner">
          <Text as="span" weight="bold">
            2. Owner
          </Text>
        </Step>
        <Step id="review">
          <Text as="span" weight="bold">
            3. Review
          </Text>
        </Step>
      </StepList>
      <StepPanel id="details">
        <DetailsForm />
      </StepPanel>
      <StepPanel id="owner">
        <OwnerForm />
      </StepPanel>
      <StepPanel id="review">
        <Review />
      </StepPanel>
      <Navigation />
    </Stepper>
  ),
});
