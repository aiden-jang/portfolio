# R35 body gloss review

Reviewed on October 23, 2026 using production builds in Chrome. The baseline is
commit `52644ab`. Both clean dusk captures use the same car, source graphite
color, camera pose, lighting and 1440 × 900 viewport.

- [Comparison](comparison.jpg) places equal crops of the baseline and revised
  render side by side. [Before](before-dusk.jpg) and [after](after-dusk.jpg) retain
  the complete clean captures.
- [Desktop night](desktop-night.jpg) shows the revised body in the portfolio.
- [Phone night](phone-night.jpg) checks the finish and framing at 390 × 844.

The named R35 body material uses roughness 0.18, clearcoat 1 and clearcoat
roughness 0.06. Hood and fender reflections become tighter, retaining source
body color, metalness, texture maps and surrounding material finishes. The
Aventador continues using its existing gloss settings through the shared paint
helper. The picker preview is refreshed from the revised clean dusk rendering.

The GLB geometry, texture pixels and asset hash are unchanged. This is a runtime
material adaptation, recorded in the [license evidence](../../../../docs/model-license-evidence.json)
and [asset notice](../../../../public/models/nissan-r35-aimgain.LICENSE.txt).
A negative regression control fails when the R35 finish dispatch is disabled and
passes when restored. The material tests also guard authored color and maps,
unrelated trim, repeated application and isolation to this car.

The garage navigation tour and R35 selection/reload checks use separate cases
so sequential model loading fits the existing test timeout. Both retain their
selection, shared URL, loading and reload assertions.

Physical-device performance and screen-reader audio were not reviewed.
