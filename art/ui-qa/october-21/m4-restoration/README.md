# BMW M4 restoration review

The G82 M4 ADRO is appended to the garage with an Amethyst default finish. Existing
car indices remain unchanged. Its saved web export retains the original geometry,
texture payload, node hierarchy, orientation and material parameters; only asset
attribution metadata is expanded.

- [Desktop](desktop.jpg): front view after resetting the camera, with body paint,
  wheels, carbon trim, lighting and floor reflection visible.
- [Phone](phone.jpg): full car and controls fit a 390 by 844 viewport.
- [Phone at night](phone-night.jpg): night lighting, tires and reflection remain visible.

The picker thumbnail is a crop of the actual rendered Amethyst car. The actual-asset
paint regression checks that recoloring changes the body material without changing
the wheel or trim colors. The asset validator reports no errors or warnings.
Browser checks cover model loading, paint changes, shared-paint restoration,
picker selection and attribution links in Chromium and WebKit. Viewport emulation
does not establish physical-phone compatibility.

The shared-paint reload check exposed a WebKit startup case where visibility was
calculated before section layout settled. Section resize observation now refreshes
that visibility after layout. The picker regression checks the current garage
inventory rather than a fixed thumbnail count.

The Contact credits retain both publisher and upstream attribution, the upstream
CC BY-NC-SA terms and the unverified CSR2 game-asset permission caveat.
