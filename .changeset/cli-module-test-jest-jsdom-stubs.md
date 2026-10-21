---
'@backstage/cli-module-test-jest': patch
---

The jsdom test environment now provides inert `IntersectionObserver`, `Element.scroll`, `Element.scrollTo` and `Element.scrollBy` implementations, which jsdom lacks. Components that rely on them, such as the Backstage UI `Drawer`, can now be rendered in tests without additional mocks.
