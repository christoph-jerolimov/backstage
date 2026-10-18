---
'@backstage/plugin-kubernetes-react': patch
---

`KubernetesDrawer` and `KubernetesStructuredMetadataTableDrawer` are now rendered with the Backstage UI `Drawer` component. The drawers are non-modal, so the page behind them stays interactive, and they close when interacting with the page or pressing Escape. The unused `kubernetesDrawer.closeDrawer` translation message was removed; the drawers use the shared close button of the `Drawer` header instead.
