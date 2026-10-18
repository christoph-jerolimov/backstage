---
'@backstage/plugin-config-schema': patch
'@backstage/plugin-kubernetes-react': patch
---

Replaced the Material UI `Divider` with the Backstage UI `Separator` component. These packages now depend on `@backstage/ui`, so apps that render them need to load the Backstage UI stylesheet, which the default app templates already do.
