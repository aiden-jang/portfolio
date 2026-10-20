# Car rendering review — October 20, 2026

The comparison starts from `baf2f01`, before this rendering correction. The Mercedes
mesh itself is unchanged; that comparison shows the lighting and reflection fix.

- [Lighting and reflection comparison](reflection-comparison.jpg)
- [Desktop cars in Dusk and Night](desktop-review.jpg)
- [Phone cars in Dusk and Night](phone-review.jpg)

The RWB uses its original full mesh. The NSX and RX-7 retain source vertex precision
and decoded texture pixels, with lossless compression. Runtime thin glazing keeps
its tint and existing alpha while using transparency instead of offscreen refraction.
Source attribution is preserved; see the [model license review](../../../../docs/model-licenses.md).
The Mercedes model is by Lexyc16 under CC BY 4.0, with its source linked there.

Captures use WebKit at desktop and narrow-phone widths with a fixed clock and
reduced motion. For stable car-focused captures, the car picker pauses decorative
rendering and its overlay is hidden during capture. Both lighting modes and paint
controls were exercised. Repeated swaps through the complete garage were also
checked in the production build without graphics resets.

This is rendering evidence for this change, not a guarantee about later revisions.
Physical phones and screen-reader audio were not tested.
