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

import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
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
import type { StepperProps } from './types';

const Progress = () => {
  const { selectedIndex, stepKeys, isFirstStep, isLastStep } = useStepper();
  return (
    <output>
      {selectedIndex + 1}/{stepKeys.length}
      {isFirstStep ? ' first' : ''}
      {isLastStep ? ' last' : ''}
    </output>
  );
};

const renderStepper = (props: Partial<StepperProps> = {}) =>
  render(
    <Stepper {...props}>
      <StepList aria-label="Create component">
        <Step id="details" title="Details" description="Name and summary" />
        <Step id="owner" title="Owner" />
        <Step id="review" title="Review" />
      </StepList>
      <StepPanel id="details">Details panel</StepPanel>
      <StepPanel id="owner">Owner panel</StepPanel>
      <StepPanel id="review">Review panel</StepPanel>
      <StepperPreviousButton />
      <StepperNextButton />
      <Progress />
    </Stepper>,
  );

describe('Stepper', () => {
  it('renders the steps in order and steps forward and backward', async () => {
    const onSelectionChange = jest.fn();
    const onLastCompletedStepChange = jest.fn();
    renderStepper({ onSelectionChange, onLastCompletedStepChange });

    const list = screen.getByRole('list', { name: 'Create component' });
    expect(list.tagName).toBe('OL');
    expect(
      screen.getAllByRole('listitem').map(item => item.textContent),
    ).toEqual([
      '1Step 1. Details Name and summary',
      '2Step 2. Owner',
      '3Step 3. Review',
    ]);

    expect(screen.getByText('Details panel')).toBeInTheDocument();
    expect(screen.queryByText('Owner panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Details/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('1/3 first');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith('owner');
    expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('details');
    expect(await screen.findByText('Owner panel')).toBeInTheDocument();
    expect(screen.queryByText('Details panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Owner/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute(
      'data-completed',
      'true',
    );
    expect(
      screen.getByRole('button', {
        name: 'Step 1, completed. Details Name and summary',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Review panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('3/3 last');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith('owner');
    expect(await screen.findByText('Owner panel')).toBeInTheDocument();
    // Going back keeps the later step reachable from the step list.
    expect(screen.getByRole('button', { name: /Review/ })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('2/3');
  });

  it('only allows selecting completed steps and the next one from the list', async () => {
    renderStepper({ defaultSelectedKey: 'owner' });

    expect(screen.getByText('Owner panel')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute(
      'data-completed',
      'true',
    );
    expect(screen.getByRole('button', { name: /Details/ })).toBeEnabled();
    // Review is only reachable through the next button.
    expect(screen.getByRole('button', { name: /Review/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Details/ }));
    expect(await screen.findByText('Details panel')).toBeInTheDocument();
    // The owner step was reached before, so it stays selectable.
    expect(screen.getByRole('button', { name: /Owner/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Review/ })).toBeDisabled();
  });

  it('lets the user select any step when skipping is allowed', async () => {
    const onLastCompletedStepChange = jest.fn();
    renderStepper({ allowsSkipping: true, onLastCompletedStepChange });

    expect(screen.getByRole('button', { name: /Review/ })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /Review/ }));
    expect(await screen.findByText('Review panel')).toBeInTheDocument();
    // Skipped steps are not marked as completed.
    expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute(
      'data-completed',
    );
    expect(screen.getAllByRole('listitem')[1]).not.toHaveAttribute(
      'data-completed',
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Details/ }));
    expect(await screen.findByText('Details panel')).toBeInTheDocument();
    // The next button still completes the current step.
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Owner panel')).toBeInTheDocument();
    expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('details');
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute(
      'data-completed',
      'true',
    );
  });

  it('supports read-only, disabled and controlled usage', async () => {
    const { rerender } = renderStepper({ isReadOnly: true });

    // Read-only steps are not buttons, but navigation still works.
    expect(
      screen.queryByRole('button', { name: /Details/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Details').closest('li')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Owner panel')).toBeInTheDocument();

    rerender(
      <Stepper isDisabled>
        <StepList aria-label="Create component">
          <Step id="details" title="Details" />
          <Step id="owner" title="Owner" isDisabled />
        </StepList>
        <StepPanel id="details">Details panel</StepPanel>
        <StepperNextButton />
      </Stepper>,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getAllByRole('listitem')[1]).toHaveAttribute(
      'data-disabled',
      'true',
    );

    const Controlled = () => {
      const [step, setStep] = useState<Key>('details');
      return (
        <Stepper
          selectedKey={step}
          onSelectionChange={key => {
            // Reject moving to the review step.
            if (key !== 'review') setStep(key);
          }}
        >
          <StepList aria-label="Create component">
            <Step id="details" title="Details" />
            <Step id="owner" title="Owner" />
            <Step id="review" title="Review" />
          </StepList>
          <StepPanel id="details" shouldForceMount>
            Details panel
          </StepPanel>
          <StepPanel id="owner">Owner panel</StepPanel>
          <StepPanel id="review">Review panel</StepPanel>
          <StepperNextButton>Continue</StepperNextButton>
        </Stepper>
      );
    };
    rerender(<Controlled />);

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Owner panel')).toBeInTheDocument();
    // Force mounted panels stay in the DOM but are hidden.
    expect(screen.getByText('Details panel')).not.toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Owner panel')).toBeInTheDocument();
    expect(screen.queryByText('Review panel')).not.toBeInTheDocument();
  });

  it('renders the text below the indicator', () => {
    render(
      <Stepper placement="below">
        <StepList aria-label="Flow">
          <Step id="a" title="A" />
        </StepList>
      </Stepper>,
    );

    expect(screen.getByRole('list').parentElement).toHaveAttribute(
      'data-placement',
      'below',
    );
  });

  it('renders the vertical orientation and custom step content', () => {
    render(
      <Stepper orientation="vertical">
        <StepList aria-label="Flow">
          <Step id="a">
            <em>Custom A</em>
          </Step>
          <Step id="b" title="B" />
        </StepList>
      </Stepper>,
    );

    expect(screen.getByRole('list').parentElement).toHaveAttribute(
      'data-orientation',
      'vertical',
    );
    expect(screen.getByRole('list').parentElement).toHaveAttribute(
      'data-placement',
      'aside',
    );
    expect(screen.getByText('Custom A')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Custom A/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });
});
