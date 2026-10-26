# Repository cleanup review

Baseline: `cb8521f`. This pass consolidates styles under their component owners,
removes overridden declarations and inactive project-grid settings, and removes
unused case-study banner rendering, hidden labels and the forwarding car-switcher
component. Car registry identities, shared links, assets and credits remain intact.
The architecture guide describes the resulting stylesheet ownership.

Production captures were reviewed at desktop, tablet, phone and narrow-phone
widths. The review covered all page sections, the case study, car picker, commands
and model credits. Computed styles on stable component matches retained their
effective layout and appearance; removed grid settings belonged to block or flex
containers. Loading and navigation state were reviewed separately from those
style comparisons.

- [Desktop Intro and car controls](desktop.jpg)
- [Phone project browsing](phone-projects.jpg)
- [Phone case study and footer](phone-story.jpg)
- [Short-phone centered Contact](short-phone-contact.jpg)

These captures use Chromium with reduced motion. The browser regression suite
also exercises Chromium and WebKit, normal-motion dialogs and keyboard access.
The complete browser run passed in both engines without retries.
Physical phones and screen-reader audio were not tested.
