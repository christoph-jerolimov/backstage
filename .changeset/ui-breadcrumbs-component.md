---
'@backstage/ui': patch
---

Added a standalone `Breadcrumbs` component that renders a navigation trail from an ordered list of links. The last item is shown as the current page, long labels truncate and reveal their full text in a tooltip, and trails with five or more items collapse the middle entries behind an ellipsis menu.

`PluginHeader` now renders its `breadcrumbs` prop with this component. Custom styles that targeted the `bui-PluginHeaderBreadcrumbsEllipsis` class need to target `bui-BreadcrumbsEllipsis` instead; the `bui-PluginHeaderBreadcrumbs` class and the `--bui-plugin-header-breadcrumbs-*` CSS variables keep working.

**Affected components:** Breadcrumbs, PluginHeader
