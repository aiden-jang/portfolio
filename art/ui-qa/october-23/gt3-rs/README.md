# GT3 RS review

Reviewed on October 23, 2026 in Chrome using a production build. The selected
vecarz model replaces the standard GT3 in the picker with permanent identity 18;
identity 12, its assets and its shared links remain available.

- [Clean dusk](clean-dusk.jpg) uses a fixed camera at 1440 × 900 and supplies the
  picker thumbnail. The original white, red and blue wrap stays fixed.
- [Desktop night](desktop-night.jpg) shows the car in the normal portfolio.
- [Orbit](orbit.jpg) records a changed view after dragging the loaded car.
- [Phone night](phone-night.jpg) checks framing and controls in the narrow phone layout.
- [Tablet dusk](tablet-dusk.jpg) checks the tablet layout and lighting toggle.

The full 1,721,938 triangles and all source vertex attributes are retained, as are
all 48 textures, their dimensions and decoded pixels, materials and hierarchy.
Lossless meshopt compression and pixel-verified lossless WebP reduce the reference
GLB from 96,861,092 to 39,102,656 bytes. Validation retains the source's single
clearcoat-normal texture-coordinate warning and reports no errors. No animation
clips are supplied; no authored wing or door animation is claimed.

The wrap combines body color and dark trim in its texture, so repaint controls
remain hidden. The blue accent represents the fixed livery in color metadata;
the authored material colors are preserved. Flat splitter and aero meshes stay
visible. Existing studio lighting and material settings are unchanged.

Regression coverage checks the retired GT3 shared link, replacement selection,
fixed livery through a linked custom color, reload behavior, and full mesh fidelity.
A wrong-picker negative control fails before restoration. Publisher, archive and
credited source all use CC BY-NC-SA 4.0; both contributors and the shared adaptation
license are retained in the asset notice, embedded metadata and Contact credits.

Rotation, lighting changes and rendering were reviewed on this Mac. The asset is
loaded only on selection, outside arrival prefetch. Physical-phone performance,
frame-rate benchmarks and screen-reader audio were not reviewed.
