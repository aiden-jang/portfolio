# Responsive visual consistency review

Local Chrome captures of the production build during the October 24 styling pass.
These are historical evidence for this revision, not production or physical-device
verification. Captures may be narrower than the requested viewport where the
browser reserves space for a scrollbar.

- `phone-viewer-before.jpg` and `phone-viewer.jpg`: the screenshot viewer at
  320 × 740. Actions now keep single-line labels and consistent touch targets;
  the project name and close action sit above the utility actions.
- `phone-credits-before.jpg` and `phone-credits.jpg`: credits at 320 × 740.
  Attribution now uses a readable single column while retaining model links and
  license notices.
- `phone-short-viewer.jpg`: the viewer at 390 × 620. The controls and caption stay
  visible while the image has its own scrolling region.
- `phone-experience.jpg`: experience at 320 × 740, with dates beneath roles and
  outcome details given the full available text width.
- `tablet-viewer.jpg` and `desktop-viewer.jpg`: the viewer at 768 × 900 and
  1440 × 900, with aligned actions and consistent panel styling.
- `desktop-projects.jpg`: the sticky project toolbar beneath the fixed header
  at 1440 × 900.

The existing phone browser navigation case also checks that screenshot action
labels do not wrap at a narrow viewport. The assertion failed against the old
layout before the styling fix was applied.
