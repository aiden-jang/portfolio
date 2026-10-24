# Compact car controls

Reviewed the production build in Chrome at 1440 × 900, 768 × 900 and 320 × 900.
Browser viewport checks do not establish physical-device behavior.

- Unsupported car actions collapse instead of leaving an empty slot.
- Fixed-livery labels use only their own space, without reserving a paint palette.
- Phone buttons form a compact centered row beneath the full-width picker.
- Paint, lighting and action buttons retain stable sizes during toggles. Selecting
  a different car can resize the bar to fit its available controls.
- Paint, lighting and Rev remained reachable on the narrow phone layout.

`desktop.jpg`, `tablet.jpg` and `phone.jpg` show the F40 without an optional action.
`phone-toggled.jpg` shows the same layout after changing paint and lighting.
`desktop-drs.jpg` and `phone-drs.jpg` show the fixed-livery F1-75 with DRS available.

The regression check reproduced a 72-pixel unused gap before the fix. Existing
car-detail and garage tests now check for compact spacing after a car change while
retaining position checks during paint, lighting, headlights and DRS toggles.
