---
'@backstage/ui': patch
---

Added a new `Stepper` component that splits a multi step flow, such as a long form, into separate steps that the user walks through one at a time.

The `StepList` shows the progress with one `Step` per step, each `StepPanel` holds the content of a step, and the `StepperPreviousButton` and `StepperNextButton` move backward and forward. Steps are laid out horizontally by default or vertically with `orientation="vertical"`, and the step text is shown aside the indicator or, with `placement="below"`, centered below it. The selected step and the completed steps can be controlled, steps can be read-only or disabled, and the `useStepper` hook gives access to the state for custom navigation such as a submit button on the last step.

```tsx
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
</Stepper>
```

**Affected components:** Stepper, StepList, Step, StepPanel, StepperPreviousButton, StepperNextButton
