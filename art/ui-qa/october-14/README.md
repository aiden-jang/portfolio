# Repository and interaction review — October 14, 2026

Reviewed the local production build in Chromium and WebKit at desktop, tablet,
phone and narrow-phone widths, including a short phone viewport. These notes
describe this revision; historical reviews describe their own revisions.

## Reviewed surfaces

- Intro, Experience, Projects, About and Contact: readable layouts, working car
  rendering and reflection, fixed navigation, and no horizontal page overflow.
- Case studies, screenshot inspection and model credits: readable content,
  reachable controls and visible keyboard focus on scrolling regions.
- Shared dialog behavior: immediate initial focus, keyboard trapping, Escape,
  return to the opening control and background scroll restoration.

The repeatable browser suite checks desktop and phone interactions and Axe
accessibility rules in both engines. Unit regressions cover sharing races,
feedback timers, keyboard shortcuts and dialog focus. Repository guards were
checked against temporary broken examples and the originals were restored.

[Phone story focus](story-focus-320.png) and
[desktop screenshot focus](screenshot-focus-1440.png) show the scrolling-region
focus treatment. The full review included the other page sections and dialogs.

## Verification limits

WebKit checks do not establish physical iPhone Safari compatibility. Physical
touch gestures, screen-reader audio and device performance were unavailable.
Production deployment and Google recrawling were outside this review.

See [Quality checks](../../../docs/quality.md) for repeatable commands and coverage.
