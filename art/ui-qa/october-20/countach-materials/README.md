# Countach material correction

Reviewed on October 20, 2026 with the production portfolio renderer. This review
supersedes the Countach appearance in [the initial replacement review](../countach-supra/README.md).

## Material changes

The downloaded tire material uses a dark rubber diffuse map with partial alpha.
Rendering it in BLEND mode hides most of the rubber and exposes the pale wheel
underneath. The tire material now renders opaque, with a rough dielectric response.
The body material's converted roughness was 1; it now uses glossy, clear-coated
paint. These are Countach-specific asset adaptations. Shared lighting, the Supra,
and other cars are unchanged.

[The comparison](comparison.jpg) shows the previous white Countach, the corrected
white Countach, and corrected Crimson paint in Night lighting. The [phone review](phone-review.jpg)
shows the same tire repair at a narrow viewport, plus the corrected Night view.
The [fidelity record](fidelity.json) verifies the same triangles, vertex attributes,
texture dimensions, decoded RGBA pixels and source attribution before and after.
The updated asset hash and adaptation notices are in [the license evidence](../../../../docs/model-license-evidence.json).

## Capture and verification

Captures use WebKit at 1440×900 and 390×900, reduced motion, New York time, and a
fixed October 13, 2026 14:00 local clock. The native car picker pauses the renderer;
its sheet and backdrop are hidden only in capture-page CSS. Images are cropped
and arranged for comparison, without retouching the cars or their lighting.
Original paint, Crimson paint and both lighting modes were reviewed. No page or
WebGL errors were reported. Physical phones were not tested.

An asset regression check requires opaque, rough rubber and coated, low-roughness
body paint. It fails for the previous asset and passes for the corrected export.
The geometry and texture comparison is independent of that material check.
