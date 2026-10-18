export const stepperUsageSnippet = `import {
  Stepper,
  StepList,
  Step,
  StepPanel,
  StepperPreviousButton,
  StepperNextButton,
} from '@backstage/ui';

<Stepper>
  <StepList aria-label="Create component">
    <Step id="details" title="Details" />
    <Step id="owner" title="Owner" />
    <Step id="review" title="Review" />
  </StepList>
  <StepPanel id="details">...</StepPanel>
  <StepPanel id="owner">...</StepPanel>
  <StepPanel id="review">...</StepPanel>
  <Flex justify="end" gap="2">
    <StepperPreviousButton />
    <StepperNextButton />
  </Flex>
</Stepper>`;

export const defaultSnippet = `<Stepper>
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
  <Flex justify="end" gap="2">
    <StepperPreviousButton />
    <StepperNextButton />
  </Flex>
</Stepper>`;

export const withDescriptionsSnippet = `<Stepper>
  <StepList aria-label="Create component">
    <Step id="details" title="Details" description="Name and summary" />
    <Step id="owner" title="Owner" description="Team and lifecycle" />
    <Step id="review" title="Review" description="Check and create" />
  </StepList>
  ...
</Stepper>`;

export const verticalSnippet = `<Stepper orientation="vertical">
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
    <Flex justify="end" gap="2">
      <StepperPreviousButton />
      <StepperNextButton />
    </Flex>
  </Flex>
</Stepper>`;

export const readOnlySnippet = `<Stepper isReadOnly>
  <StepList aria-label="Create component">
    <Step id="details" title="Details" />
    <Step id="owner" title="Owner" />
    <Step id="review" title="Review" />
  </StepList>
  ...
</Stepper>`;

export const disabledStepSnippet = `<Stepper>
  <StepList aria-label="Create component">
    <Step id="details" title="Details" />
    <Step id="owner" title="Owner" isDisabled />
    <Step id="review" title="Review" />
  </StepList>
  ...
</Stepper>`;

export const controlledSnippet = `const SubmitOrNext = () => {
  const { isLastStep } = useStepper();
  return isLastStep ? (
    <Button onPress={handleSubmit}>Create</Button>
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

const [name, setName] = useState('');
const [step, setStep] = useState<Key>('details');

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
    <TextField label="Name" isRequired value={name} onChange={setName} />
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
</Stepper>`;

export const customStepContentSnippet = `<Stepper>
  <StepList aria-label="Create component">
    <Step id="details">
      <Text as="span" weight="bold">1. Details</Text>
    </Step>
    <Step id="owner">
      <Text as="span" weight="bold">2. Owner</Text>
    </Step>
    <Step id="review">
      <Text as="span" weight="bold">3. Review</Text>
    </Step>
  </StepList>
  ...
</Stepper>`;

export const statusIndicatorsSnippet = `<Stepper isReadOnly selectedKey="deploy" lastCompletedStep="test">
  <StepList aria-label="Pipeline">
    <Step
      id="build"
      title="Build"
      description="2 minutes"
      indicator={<RiCheckLine />}
    />
    <Step
      id="test"
      title="Test"
      description="Failed"
      indicator={<RiCloseLine />}
    />
    <Step
      id="deploy"
      title="Deploy"
      description="Running"
      indicator={<RiLoader4Line />}
    />
    <Step id="verify" title="Verify" />
  </StepList>
</Stepper>`;
