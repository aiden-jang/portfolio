# Navigation history and resilient screenshots

Opening a case study adds a history entry. Back closes it and Forward reopens it;
explicit Close returns through the same entry. Cycling within the modal replaces its
entry. Garage URL updates preserve history state. Initial deep links still open their
case study directly without requiring a prior in-page entry.

Verified Back/Forward and Close at 1440 and 390 widths, retaining the selected AI filter
and page scroll position. Added a slim case-study reading-progress indicator and checked
that it reaches the end after scrolling the body.

Screenshot dimensions are recorded from the assets to reserve space before loading.
The common image component handles thumbnail, case-study and enlarged-view failures
with a readable fallback. Aborted screenshot requests were inspected on a phone;
project stories and live-app links remain accessible.

Contact was checked at 390-by-664 with normal and reduced motion. Scrolling to the end
keeps credits above the bottom controls. The project order remains unchanged: the globe
and bloomnote introduce realtime engineering and a personal AI product respectively.

Browser simulations cannot verify real Safari/Chrome finger feel or the exact behavior
of physical browser toolbars. Those remain real-device checks. The résumé is unchanged.
