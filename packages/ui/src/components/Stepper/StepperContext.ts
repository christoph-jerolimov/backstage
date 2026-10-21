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

import { createContext, useContext } from 'react';
import type { StepperState } from './types';

/** @internal */
export const StepperContext = createContext<StepperState | undefined>(
  undefined,
);

/** @internal */
export const StepIndexContext = createContext<number>(-1);

/**
 * Returns the state and actions of the surrounding {@link Stepper}, for
 * example to render a custom submit button on the last step or to show the
 * current progress.
 *
 * @remarks
 * Must be used inside a `Stepper`.
 *
 * @example
 * ```tsx
 * const StepperProgress = () => {
 *   const { selectedIndex, stepKeys } = useStepper();
 *   return (
 *     <Text>
 *       Step {selectedIndex + 1} of {stepKeys.length}
 *     </Text>
 *   );
 * };
 * ```
 *
 * @public
 */
export function useStepper(): StepperState {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a Stepper component');
  }
  return context;
}
