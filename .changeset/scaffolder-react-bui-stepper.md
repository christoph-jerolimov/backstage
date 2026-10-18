---
'@backstage/plugin-scaffolder-react': patch
---

The template wizard stepper and the task progress steps now use the Backstage UI `Stepper` component instead of the Material UI stepper. The step list of the wizard still lets users go back to a previously completed step, and the task steps keep showing the status and duration of each step. Both step lists are padded and scroll horizontally when the steps do not fit the available width.
