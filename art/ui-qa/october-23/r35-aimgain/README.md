# Aimgain R35 visual review

Reviewed on October 23, 2026, using the production build in Chrome.
The selected model is vecarz’s Nissan Aimgain GT R35 Type2, with its official
full-resolution glTF material settings. The original-format upload carries
Outlaw’s different material settings and is retained only as attribution evidence.

## Appearance and interaction

- [Clean dusk](clean-dusk.jpg) supplies the actual rendered picker preview.
  [The picker](picker.jpg) shows that preview in the selected garage slot.
- [Desktop dusk](desktop-dusk.jpg) and [desktop night](desktop-night.jpg) show
  the original graphite body finish in both portfolio lighting modes.
- [Optional blue paint](desktop-blue.jpg) shows recoloring restricted to the named
  body panels, retaining wheels, carbon trim, glass and purple calipers.
- [Phone dusk](phone-dusk.jpg), [phone orbit](phone-orbit.jpg) and
  [tablet dusk](tablet-dusk.jpg) show responsive framing and reachable controls.
  Phone rotation was exercised by dragging the car.

The original graphite finish is the default; source materials are not replaced
with the different Outlaw upload. No animation is fabricated. The flat front
splitter and underbody meshes remain visible. The stock A80 Supra stays in the
garage; the modified A90 picker slot becomes the R35, while old A90 URLs retain
that Supra.

## Fidelity and terms

Decoded comparison retains all 549,485 triangles and exact vertex attributes,
material parameters, hierarchy, texture dimensions and RGBA pixels. Lossless
compression reduces the reference export from 22,365,024 to 10,810,140 bytes.
Decoded glTF validation reports no errors or warnings. The source has no clips.
The negative paint control fails when the explicit body target is missing and
passes when restored.

See [license evidence](../../../../docs/model-license-evidence.json) and the
[asset notice](../../../../public/models/nissan-r35-aimgain.LICENSE.txt). Both
vecarz and Outlaw are credited, and the upstream noncommercial restriction is
retained. Publisher records do not independently establish underlying authorship
or vehicle rights.

## Verification

Full repository verification passed. Focused garage, racing-livery and external
attribution browser checks passed in Chromium and WebKit at desktop and phone
widths. The garage checks exercise R35 selection and reload, and preserve the
retired-car URL behavior.

Physical-device performance and screen-reader audio were not reviewed.
