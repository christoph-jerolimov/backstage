---
'@backstage/plugin-catalog': patch
'@backstage/plugin-catalog-graph': patch
'@backstage/plugin-catalog-import': patch
'@backstage/plugin-devtools': patch
'@backstage/plugin-home-react': patch
'@backstage/plugin-kubernetes-react': patch
'@backstage/plugin-scaffolder': patch
'@backstage/plugin-scaffolder-react': patch
'@backstage/plugin-search-react': patch
'@backstage/plugin-techdocs': patch
---

Replaced the Material UI circular progress spinner with the Backstage UI `Spinner` component for loading indicators. The spinner now inherits the color of the surrounding text instead of using the Material UI primary color.
