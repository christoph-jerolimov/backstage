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

/**
 * Represents a single entry in the {@link Breadcrumbs} trail.
 *
 * @public
 */
export interface BreadcrumbItem {
  /**
   * Text shown for the entry.
   */
  label: string;
  /**
   * URL the entry links to. Relative URLs resolve against the current route.
   */
  href: string;
}

/**
 * Own props for the {@link Breadcrumbs} component.
 *
 * @public
 */
export interface BreadcrumbsOwnProps {
  /**
   * Ordered entries from the root page to the current page. The last entry
   * is treated as the current page.
   */
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Props for the {@link Breadcrumbs} component.
 *
 * @public
 */
export interface BreadcrumbsProps
  extends BreadcrumbsOwnProps,
    Omit<React.HTMLAttributes<HTMLElement>, keyof BreadcrumbsOwnProps> {}
