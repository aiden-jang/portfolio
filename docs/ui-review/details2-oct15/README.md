# Screenshot navigation and high contrast

Projects with multiple screenshots expose Previous and Next controls, a view label
and a position counter inside the viewer. Arrow keys wrap through fitted images.
A zoomed image keeps its arrow-key panning behavior. Changing the screenshot resets
the image scroll position; the shared view link follows the selected screenshot.
Closing the viewer restores focus to its opening preview.

- [Desktop](details2-viewer-1440-none.png)
- [Phone](details2-viewer-390-none.png)
- [Desktop with forced colors](details2-viewer-1440-active.png)
- [Phone with forced colors](details2-viewer-390-active.png)

Browser journeys exercise both directions, wrapping, zoom, focus restoration and
accessibility in Chromium and WebKit. The arrow-key assertion was checked against
a deliberately disabled handler, then restored and passed. These captures use
Chromium with emulated high contrast. Physical-device navigation and spoken
screen-reader output remain device checks.
