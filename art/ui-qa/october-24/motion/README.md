# Motion review

Local production preview reviewed in Chrome on October 24, 2026, at requested
viewports of 1440 × 900 and 390 × 900.

- Case studies open and close through the native morph, including browser Back and Forward. The settled panel has no additional entrance animation.
- A directly loaded shared case study uses the shared dialog entrance.
- Screenshot viewers, car browsing, commands and credits use short entrances. Screenshot images reveal after loading, without changing their crop.
- The phone menu opens within the viewport and closes when a section is chosen. The fixed header changes its background through a brief color transition.
- Closing dialogs restores focus and releases the background scroll lock.

The existing desktop and phone browser navigation cases exercise normal-motion
case studies and screenshot viewers alongside reduced-motion navigation. Unit
regressions cover duplicate history events, superseded morph cleanup, late update
callbacks and live reduced-motion changes for pointer-follow controls. They failed
against the preceding implementations before the fixes.

The stills record settled layouts, not frame-by-frame animation smoothness.
Physical-device performance and screen-reader audio were not checked.
