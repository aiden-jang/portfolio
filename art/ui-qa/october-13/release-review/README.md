# Release usability review

Two issues were reproduced and fixed:

- Closed case studies retained an invisible Close button in the tab order. The closed
  dialog now unmounts. A regression test failed before the fix and passed afterward.
- Case-study sharing failed silently when system sharing and clipboard access were
  unavailable. It now announces the failure and provides a selectable, labeled link.
  A regression test failed before the fix and passed afterward. The narrow-screen
  capture shows the component in a temporary failure harness, removed after review.

The repository verification suite passed after these fixes. Component tests also
verified readable missing-image feedback and that a failed 3D scene leaves portfolio
content available.

Native browser checks covered mobile menu opening, Escape returning focus to Menu,
gallery zoom and dismissal, focus returning to the image trigger, and restored page
scrolling. No hidden story dialog remains after closing. The mobile gallery capture
records the reviewed page.

Loading and motion were reviewed in source: the scene is lazy and suspended independently
of the text; optional model prefetch respects limited connections and data saving;
camera movement, car spin, navigation and CSS transitions respect reduced motion.
The existing connection-policy tests passed. Network throttling, screen-reader audio
and physical touch behavior were not exercised by the available browser interface.

Screenshot, favicon, touch-icon, manifest-icon, social-card and résumé assets exist.
The live site at aidenjang.com was inspected: it still serves an older revision, with
the previous intro copy and keyboard hints. These local commits have not been pushed.
Safari and physical-phone testing remain unavailable through the connected tools.
The résumé was not modified.
