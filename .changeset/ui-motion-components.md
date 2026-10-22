---
'@backstage/ui': patch
---

Reworked component animations on top of the new motion tokens:

- Tabs and header navigation indicators are now rendered inside each tab or link and slide between items with React Aria shared element transitions, replacing the previous measurement-based positioning. If you override `.bui-TabActive`, `.bui-TabHovered`, `.bui-HeaderNavActive` or `.bui-HeaderNavHovered`, note that these elements are now positioned relative to their tab.
- Tab panels fade in when switching tabs.
- Accordion panels animate their height when expanding and collapsing.
- Dialog now uses interruptible transitions instead of keyframe animations, so quickly opening and closing no longer jumps.
- Spinner and skeleton keyframes are defined once as `bui-spin` and `bui-pulse`.
