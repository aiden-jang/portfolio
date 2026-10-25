# Mobile navigation and controls

Reviewed the phone intro, section menu, car loading and All controls at narrow
phone widths, with touch-layout checks extending to a tablet width.

- Phones use the persistent Menu for all sections instead of intro-only dots.
- Loading feedback clears the shared header and remains within the viewport.
- Touch layouts hide keyboard hints, expose Close, restore trigger focus and keep
  sharing feedback visible. Keyboard actions remain available.

[Phone loading capture](phone-loading.png) shows a held next-car download. The
previous Ferrari remains visible while the selected Mercedes is loading.
[Phone controls capture](phone-controls.png) shows the touch menu without keyboard
instructions and with its visible Close action.

The new browser regressions first failed against the previous implementation for
the visible dots, keyboard instructions and overlapping loading banner. The touch
dismissal check also caught WebKit leaving focus behind when opening from a tap.
Verification uses `npm run verify` and the complete browser suite in Chromium and
WebKit. The local browser run disables trace recording and uses headed browsers;
CI's trace and failure settings are unchanged. Physical-phone Safari and
screen-reader audio were not tested.
