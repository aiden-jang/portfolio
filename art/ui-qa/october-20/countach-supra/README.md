# Countach and Supra review

Reviewed on October 20, 2026 using the production portfolio renderer. The Supra
replaces garage slot 2 and the Countach replaces slot 6; URL indices remain stable.
The model sources, supplied license notices, archive hashes and exported asset
hashes are recorded in [the license evidence](../../../../docs/model-license-evidence.json).

The Countach material rendering in these initial captures is superseded by the
[material correction review](../countach-materials/README.md), which fixes
transparent rubber and matte bodywork. These files remain as historical evidence
of the initial conversion and lossless compression comparison.

## Captures

- [Desktop review](desktop-review.jpg): Supra on the first row, Countach on the
  second; Dusk, Night and a contrasting paint selection from left to right.
- [Tablet review](tablet-review.jpg): both cars in Dusk at a 768px viewport.
- [Phone review](phone-review.jpg): the same cars at a 390px viewport, with Dusk,
  Night and Crimson paint for each car.
- [Compression comparison](compression-comparison.jpg): uncompressed reference
  and optimized exports under identical portfolio lighting. The Countach reference
  includes the documented legacy material conversion needed by the current loader.
- [Fidelity measurements](fidelity.json): decoded geometry, texture and glTF
  validation results, plus the screenshot comparison measurements.

WebKit captures use 1440×900, 768×900 and 390×900 viewports, reduced motion, New York time
and a fixed October 13, 2026 14:00 local clock. The native car picker pauses the
scene for stable capture; its sheet and backdrop are hidden only in capture-page
CSS. Production scene code and lighting remain active. Screenshots come from the
rendered app, without generated imagery or retouching of the cars.

The geometry comparison checks every triangle's positions, normals and UVs against
the official glTF download, allowing vertex reordering and cyclic triangle order.
All texture dimensions and decoded RGBA pixels are preserved. The screenshot
comparison is separate from these data checks: small raster differences can occur
with triangle ordering and transparent surfaces. Compression does not establish
identical rendering across different engines or a match to Sketchfab's lighting.

Desktop and phone-width review covers original paint, alternate paint, both
lighting modes, framing and reflection. Chromium and WebKit interaction checks
cover the surrounding interface and updated credit links. Physical phones were
not tested. The Countach's material conversion and manufacturer-rights limitations
are described in [the license review](../../../../docs/model-licenses.md).
