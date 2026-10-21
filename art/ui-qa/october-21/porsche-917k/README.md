# Porsche 917K review

The selected vecarz red Le Mans version is appended to the existing garage.
The source and its credited JUSTGAME upstream listing both publish CC BY 4.0.
The official download notice, sources, archive hash and export measurements are
recorded in [the license evidence](../../../../docs/model-license-evidence.json).

The local export retains the full mesh, floating-point vertex attributes, decoded
texture pixels, texture dimensions and material parameters. It uses vertex
reordering, lossless meshopt compression and lossless WebP where smaller. No
simplification, texture resizing or material roughness changes are applied.
A decoded triangle/attribute comparison, texture comparison, material comparison
and glTF validation passed. Both source credits are retained in the GLB metadata
and the site's credits dialog.

[The comparison](source-comparison.jpg) shows the reference and optimized exports
under the same fixed camera, studio environment, framing and lighting. The source
livery, tires, glazing, headlights and reflections visually match. The initial
review used the local development build; [the production capture](production.jpg)
confirms the new model loads in the built application. Interface captures cover
[desktop](desktop.jpg), [tablet](tablet.jpg), [phone](phone.jpg), the
[phone picker](picker-phone.jpg) and [night lighting](night.jpg). Paint selection
updates the shared URL, and the default restores the original racing livery.

Viewport checks do not establish physical-device performance or Safari behavior
on an actual iPhone. Production-build verification and Chromium/WebKit regressions
are required separately by the repository conventions.
