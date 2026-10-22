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

import { SharedElement } from 'react-aria-components';

/** @internal */
export interface SharedIndicatorProps {
  /** Name shared by the elements that animate between each other. */
  name: string;
  /** Whether the indicator is shown in this parent. */
  isVisible: boolean;
  className: string;
}

/**
 * Whether React Aria's shared element transitions can run. They rely on the
 * Web Animations API, which jsdom does not implement.
 */
const supportsSharedElementTransitions = () =>
  typeof Element !== 'undefined' &&
  typeof Element.prototype.getAnimations === 'function';

/**
 * An indicator that slides between parents using a React Aria shared element
 * transition. Must be rendered inside a `SharedElementTransition` scope, which
 * React Aria's `TabList` already provides.
 *
 * Without the Web Animations API (for example in jsdom tests) it renders a
 * static element instead, so hovering or focusing items never throws.
 *
 * @internal
 */
export function SharedIndicator(props: SharedIndicatorProps) {
  const { name, isVisible, className } = props;

  if (supportsSharedElementTransitions()) {
    return (
      <SharedElement name={name} isVisible={isVisible} className={className} />
    );
  }

  return isVisible ? <div className={className} /> : null;
}
