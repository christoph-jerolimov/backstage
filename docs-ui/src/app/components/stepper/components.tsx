'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import {
  Stepper,
  StepList,
  Step,
  StepPanel,
  StepperPreviousButton,
  StepperNextButton,
} from '../../../../../packages/ui/src/components/Stepper/Stepper';
import { useStepper } from '../../../../../packages/ui/src/components/Stepper/StepperContext';
import { Button } from '../../../../../packages/ui/src/components/Button/Button';
import { Flex } from '../../../../../packages/ui/src/components/Flex/Flex';
import { Text } from '../../../../../packages/ui/src/components/Text/Text';
import { TextField } from '../../../../../packages/ui/src/components/TextField/TextField';

const DetailsForm = () => (
  <Flex direction="column" gap="4">
    <TextField label="Name" placeholder="my-service" />
    <TextField label="Description" placeholder="What does it do?" />
  </Flex>
);

const OwnerForm = () => (
  <Flex direction="column" gap="4">
    <TextField label="Owner" placeholder="team-a" />
    <TextField label="Lifecycle" placeholder="production" />
  </Flex>
);

const Review = () => (
  <Text>Review the information and press Create to finish.</Text>
);

const Panels = () => (
  <>
    <StepPanel id="details">
      <DetailsForm />
    </StepPanel>
    <StepPanel id="owner">
      <OwnerForm />
    </StepPanel>
    <StepPanel id="review">
      <Review />
    </StepPanel>
  </>
);

const Navigation = () => (
  <Flex justify="end" gap="2">
    <StepperPreviousButton />
    <StepperNextButton />
  </Flex>
);

export const Default = () => {
  return (
    <Stepper>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" />
        <Step id="owner" title="Owner" />
        <Step id="review" title="Review" />
      </StepList>
      <Panels />
      <Navigation />
    </Stepper>
  );
};

export const WithDescriptions = () => {
  return (
    <Stepper>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" description="Name and summary" />
        <Step id="owner" title="Owner" description="Team and lifecycle" />
        <Step id="review" title="Review" description="Check and create" />
      </StepList>
      <Panels />
      <Navigation />
    </Stepper>
  );
};

export const Vertical = () => {
  return (
    <Stepper orientation="vertical">
      <StepList aria-label="Create component">
        <Step id="details" title="Details" description="Name and summary" />
        <Step id="owner" title="Owner" description="Team and lifecycle" />
        <Step id="review" title="Review" description="Check and create" />
      </StepList>
      <Flex direction="column" gap="4" style={{ flex: 1 }}>
        <Panels />
        <Navigation />
      </Flex>
    </Stepper>
  );
};

export const ReadOnly = () => {
  return (
    <Stepper isReadOnly>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" />
        <Step id="owner" title="Owner" />
        <Step id="review" title="Review" />
      </StepList>
      <Panels />
      <Navigation />
    </Stepper>
  );
};

export const DisabledStep = () => {
  return (
    <Stepper>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" />
        <Step id="owner" title="Owner" isDisabled />
        <Step id="review" title="Review" />
      </StepList>
      <Panels />
      <Navigation />
    </Stepper>
  );
};

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

export const Controlled = () => {
  const [name, setName] = useState('');
  const [step, setStep] = useState<Key>('details');

  return (
    <Stepper
      selectedKey={step}
      onSelectionChange={key => {
        // Only leave the first step once a name was entered.
        if (step === 'details' && name.trim() === '') return;
        setStep(key);
      }}
    >
      <StepList aria-label="Create component">
        <Step id="details" title="Details" />
        <Step id="owner" title="Owner" />
        <Step id="review" title="Review" />
      </StepList>
      <StepPanel id="details" shouldForceMount>
        <TextField
          label="Name"
          placeholder="my-service"
          isRequired
          value={name}
          onChange={setName}
        />
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
};

export const CustomStepContent = () => {
  return (
    <Stepper>
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
      <Panels />
      <Navigation />
    </Stepper>
  );
};
