# Car controls review

Local Chrome captures of the production build during the October 25 control
cleanup. These describe this revision, not production or physical-device checks.

- `phone-miata.jpg`: 390 × 844, showing the wider paint label, headlight action,
  lighting and compact All controls trigger without a Rev button.
- `phone-narrow.jpg`: 320 × 740, with all primary controls contained in the phone
  viewport. Long paint names truncate while keeping the complete accessible name.
- `tablet-miata-final.jpg`: 768 × 900, with the compact dock and paint swatches.
- `desktop-reset-final.jpg`: 1440 × 900, with Reset view outside the main row after
  dragging. The other controls retain their positions.

The review also opened All controls and found setup sharing through search. The
Miata's model, paint, reflection, studio lights and pop-up headlight feature retain
their existing assets and finish. The new tap response uses the existing road
lamps; it does not shake the camera or amplify the floor glow. Film grain is static.

The camera regression failed against the earlier behavior because the view kept
moving after a drag. Hit-test regressions were checked against an intentionally
overbroad response before restoring model-only raycasting.

Desktop and phone navigation checks passed in WebKit and headed Chromium. The
broader headless model tour encountered local loading and time-budget failures;
it is not recorded as a passing full suite. Physical phones were not available.
