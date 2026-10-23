# Headlights and racing finish review

Chrome desktop and phone viewport review of the Miata's reversible pop-up headlights
and the Ferrari 296 GT3's corrected material response.

- [Phone comparison](review.jpg) shows raised and lowered lights beside the Ferrari.
- [Desktop controls](miata-raised-desktop.jpg) show the Lights button and raised pose.
- [Dusk Ferrari](ferrari-dusk.jpg) and [night Ferrari](ferrari-night.jpg) retain the
  silver/red printed livery with neutral glazing and a less metallic body finish.
- [Clean Miata](miata-clean.jpg) and the dusk Ferrari supply the refreshed picker previews.

The Miata uses its embedded rotation animation, sampled only through the opening
segment so the raised state holds instead of automatically closing. The button is
keyboard accessible, disabled until its model and clip are ready, and absent on
other cars. Reduced motion snaps to each endpoint. Regression coverage checks
selection changes, loading guards, the actual asset's animation samples, endpoint
holding, interrupted travel, cleanup, and desktop/phone button behavior.

Ferrari corrections apply only to its named body and glazing materials at runtime.
The livery is offset ahead of overlapping shell surfaces, printed panels stop
behaving like bare metal, and green metallic glass becomes neutral transparent
glazing. Texture data, geometry, wheel finishes and all other cars remain unchanged.
Negative controls confirmed the regression tests fail if the body is made metallic
again or the requested headlight state is ignored; restored implementations pass.
No temporary material-isolation diagnostics are included in the implementation.

This is desktop browser viewport emulation, not physical-phone GPU or screen-reader
verification. Repository verification and Chromium/WebKit regression results are
reported by the check commands.
