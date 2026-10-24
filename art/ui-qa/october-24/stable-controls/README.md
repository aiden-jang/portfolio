# Stable car controls

Reviewed the production build in Chrome at 1440 × 900, 768 × 900 and 320 × 900.
These are browser viewport checks, not physical-device tests.

- Desktop and tablet controls fit without overflow.
- Switching Night/Dusk and cycling paint keeps the bar and its controls in place.
- Paint and optional car interactions retain their slots across car changes.
  Fixed-livery cars show a label instead of a paint control.
- Picker names stay within a fixed-height row. Long phone paint names truncate
  within their own slot while keeping the full accessible label.
- Buttons no longer scale on hover or activation.

`desktop-dusk.jpg` and `desktop-night.jpg` show the desktop lighting toggle;
`tablet.jpg` shows the compact desktop layout. `phone-night.jpg` and
`phone-dusk.jpg` show the narrow phone layout with the same Bordeaux paint.

The existing car-detail and curated-garage browser cases also compare control
positions after lighting, paint, headlights, DRS and car-selection changes.
