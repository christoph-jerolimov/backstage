---
'@backstage/plugin-kubernetes-react': patch
'@backstage/plugin-kubernetes': patch
---

Migrated all components from Material UI to Backstage UI and Remix icons, and removed the Material UI dependencies. The resource details are now shown in a Backstage UI side panel, accordions are rendered with Backstage UI, and the Argo Rollout canary steps use a custom progress indicator. Apps rendering these plugins must load the Backstage UI stylesheet.
