# BMW M1 Turbo review

These captures document the M1's initial addition. It is now retired from the
picker; its permanent shared-link identity and original BMW Motorsport livery remain.
It loads only on selection.
Both vecarz and the credited JUSTGAME source list CC BY 4.0; attribution and the
adaptation notice are included in the asset and Contact credits.

Lossless compression reduces the full-resolution download by approximately 66%.
The [fidelity record](validation.json) confirms exact geometry, vertex attributes,
texture pixels and hierarchy against the converted reference. The separate
[material conversion record](conversion-validation.json) checks the original
download against that modern PBR reference, including diffuse colors, alpha,
roughness, specular factors and texture bindings. The original livery remains fixed.

Production browser captures show the model in the actual portfolio scene:

- [Desktop](desktop.jpg)
- [Tablet](tablet.jpg)
- [Phone](phone.jpg)
- [Narrow phone](narrow-phone.jpg)
- [Night on desktop](night-desktop.jpg)
- [Night on phone](night-phone.jpg)

Garage assertions first rejected the missing M1 entry; the browser check also
caught its missing picker preview before the preview was generated. Coverage
checks visible racing colors, fixed-livery links, picker focus, the preview,
reloads and both creator credits. Final evidence comes from Chromium and WebKit
browser checks after live preview controls became unreliable. The full run exposed
a Contact measurement that included the scrollbar gutter; its corrected layout
measurement keeps the existing tolerance. An existing WebKit livery interaction
stalled once and passed unchanged on rerun. The affected checks and final M1
cases passed in both engines. Physical phones and screen-reader audio were not
tested.
