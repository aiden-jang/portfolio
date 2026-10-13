# Interaction review

The project jump menu now reflects the project at the reading line, updates as the
page scrolls, and clears outside Projects. It pauses while a story pins the page.
The observer is refreshed when the filtered project list changes.

Screenshot images retain their intrinsic dimensions and show a static, subdued loading
texture until they load. Cached images are recognized, failures retain the existing
readable fallback, and the busy state is cleared after loading.

The image viewer scrolls inside its image region. Its Fit image and Close controls
remain visible while exploring a zoomed screenshot. Native narrow-browser scrolling
verified that the image moved while the dialog header stayed in place. Physical
touch and pinch behavior were not tested.

Filter continuity already worked and was retained. A native browser sequence using
the AI filter, a bloomnote story, Back, Forward and Escape preserved the filter and
returned to the same project. The gallery scroll lock was released.

Contact copy feedback now ignores older requests that finish after the latest one,
clears superseded reset timers and cleans up on unmount. The message reserves enough
space for narrow-screen failure text. The regression test failed with the request
guard removed and passed after restoring it. A pending-image test verifies the busy
state ends on load. The full repository verification suite passed.

Captures include the active desktop project, zoomed mobile viewer, filtered return,
and Contact layout. Safari and physical-phone checks remain unavailable. The résumé
was not modified.
