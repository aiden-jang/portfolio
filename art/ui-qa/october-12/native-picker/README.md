# Native car-picker follow-up

The macOS in-app browser's native accessibility interface was used rather than headless Chromium. Space expanded the model menu; Down and Return selected another model. The URL, selected option and chassis caption changed together. Once the model finished loading, focus returned to the picker without scrolling the page. Navigating to About retained link focus and the reading section.

The picker temporarily disables itself while loading. It now remembers selection focus and restores it only if focus is still on the document body and the car section remains visible. A visitor who moves to another control or reading section does not have focus pulled back.

Escape closed the native menu. In this browser the arrow selection can commit before Escape, so Escape is not asserted to roll back an already selected model.

The full repository verification passed. This resolves native selection in the in-app browser, not Safari compatibility. Safari, physical-phone feel, externally generated sharing cards and a participant visitor test remain outstanding. The résumé is unchanged.
