# Countach paint review

The selected vecarz Countach 5000 QV is appended with permanent garage identity 19,
keeping all existing shared identities intact. It appears beside the Aventador in
the picker and loads only on selection.

[Before](before-dusk.jpg) and [after](after-dusk.jpg) use the same clean-capture
camera, dusk lighting and Giallo body color. [Comparison](comparison.jpg) puts the
source finish on the left and the tuned finish on the right. The frames are
1440 × 665; the picker thumbnail is cropped from the tuned frame.
[Phone night](phone-night.jpg) shows the normal portfolio and controls at a narrow
phone width. [Blue desktop](desktop-blue.jpg) and [tablet dusk](tablet-dusk.jpg) show an alternate
body color with separate silver wheels, black tires and trim. The tablet frame
uses the 820-pixel viewport breakpoint. These captures review the production build
in Chrome on this Mac.

Body repainting targets only `Meshpart19Mtl`. Its roughness is reduced and it uses
a glossy dielectric clearcoat. The separate `Meshpart2Mtl` tire surface remains
opaque with a rough, nonmetallic finish and no clearcoat. Wheels, black trim,
glazing and the other source finishes remain separate. The supplied headlights
are already raised; the export has no animation clips and exposes no pop-up button.

The selected official glTF export's entire mesh, vertex precision, hierarchy and
all texture dimensions and decoded pixels are retained. Lossless compression
reduces the reference GLB from 13,336,428 to 7,625,704 bytes. Decoded validation has
no errors or warnings. Publisher, archive and credited original list CC BY 4.0;
vecarz and Randomness are credited in Contact, embedded metadata and the asset notice.

A regression using the real asset fails against the untreated finish and passes
with the body/rubber corrections. It also verifies that surrounding materials are
unchanged and repeated preparation reuses the finish. Browser coverage checks
selection focus, cold shared paint, restoring the default, and changing paint
across phone and desktop layouts with one model load per engine. It also verifies
the absence of an unsupported pop-up animation control. Existing garage checks
retain old links, reload behavior and the added picker choice.

Viewport emulation and desktop browser engines do not establish physical-phone
performance or compatibility. Frame-rate benchmarks, physical devices and
screen-reader audio were not reviewed.
