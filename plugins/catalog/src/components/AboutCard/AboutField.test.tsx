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

import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { AboutField } from './AboutField';

describe('<AboutField />', () => {
  it('renders the label above the value, children or an unknown fallback', async () => {
    const { rerender } = await renderInTestApp(
      <AboutField label="Owner" value="team-a" className="custom" />,
    );

    const label = screen.getByText('Owner');
    expect(label).toBeInTheDocument();
    expect(label.nextSibling).toHaveTextContent('team-a');
    expect(label.parentElement).toHaveAttribute('data-variant', 'vertical');
    expect(label.parentElement).toHaveClass('custom');

    rerender(
      <AboutField label="Owner" value="ignored">
        <a href="/team-a">team-a link</a>
      </AboutField>,
    );
    expect(
      screen.getByRole('link', { name: 'team-a link' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();

    rerender(<AboutField label="Owner" />);
    expect(screen.getByText('Owner').nextSibling).toHaveTextContent('unknown');
  });
});
