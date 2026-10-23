# Curated garage review

Reviewed October 22, 2026 against the production build, using desktop and narrow-phone
Chrome views. Captures show the selected default paint or original racing livery.
The contact sheets combine actual rendered screenshots; the picker previews use
clean scene captures with the same studio lighting and fixed front three-quarter camera.

[Garage lineup](garage.jpg) · [Phone layouts](phones.jpg) · [Car picker](picker.jpg)

The visible order runs from classics through modified road cars to racing:
F40, 300 SL, Datsun 280Z, E30, Supra A80, MX-5 NA, RWB, M4 ADRO, R8,
modified GR Supra, 911 GT3, Aventador SV, Ferrari 296 GT3 and Red Bull RB16B.
The stock 930 and 917K remain accessible through their original shared IDs and
remain credited, while selection controls follow the curated order.

## Asset verification

[Decoded comparisons](asset-validation.json) record the exact vertex attributes,
triangles, texture dimensions and RGBA pixels, material parameters, hierarchy and
animation data retained from each chosen reference. Exports reorder and losslessly
compress geometry and encode lossless WebP without mesh simplification, texture
resizing or vertex quantization. Decoded glTF validation reports no errors or warnings.
The combined new exports are about 40% smaller than their uncompressed web references.

The RB16B and 296 GT3 use official full-resolution web exports, preserving the
publisher’s displayed material setup rather than the problematic original uploads.
The Red Bull’s original upload rendered solid surfaces transparently; the Ferrari’s
original upload gave the wheels and body the wrong material response. Both retain
fixed liveries. The RB16B preserves floor and wing meshes and omits road-car lights.
The Ferrari’s diagonal source pose is normalized before framing and grounding.
Repaintable additions use explicit body materials to protect wheels and trim.

Source attribution, archive hashes, selected publisher terms and discovered
upstream notices are in the [license evidence](../../../../docs/model-license-evidence.json)
and [license review](../../../../docs/model-licenses.md). Publisher licenses do
not independently verify game-asset or manufacturer rights.

## Interaction review

The browser regressions exercise older shared links, retired selections, the
curated picker’s initial focus and arrow wrapping, numbered selection, reloads,
paint, fixed liveries, credits and a visible clean-capture scene. Existing project,
accessibility and navigation checks remain part of the required suite.

Physical-device Safari, screen-reader audio and actual phone GPU performance are
outside this desktop browser review. Viewport emulation is not a physical-device test.
