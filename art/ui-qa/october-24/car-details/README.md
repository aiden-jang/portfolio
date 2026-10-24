# Car-specific details review

Reviewed the F1-75 and RB16B DRS controls and the Supra A80 headlight flash in a
local production build on October 24, 2026. These interactions use existing parts;
the F1 movements are custom runtime animations, rather than supplied clips.

- `ferrari-closed.jpg` and `ferrari-open.jpg`: desktop DRS states, with the action
  beside the car picker. Idle rotation changes the camera angle between captures;
  these are visual references, not a pixel comparison.
- `ferrari-phone.jpg` and `red-bull-phone.jpg`: phone layouts with DRS open.
- `supra-flash.jpg`: tablet-width view during the headlight flash.
- `supra-phone.jpg`: narrow-phone view after tightening control spacing. Paint,
  lighting, Flash and Rev share a row without horizontal overflow.

Checked reversible wing movement, visible lamp emission, automatic brightness
restoration, keyboard activation and control placement. Real-model unit fixtures
verify that only the DRS assembly moves and only front lamp triangles glow; the
Supra's shared rear lamp material is retained. Changing cars resets the detail
state and releases owned resources. Reduced motion snaps wing poses and uses one
steady light pulse. Browser regressions cover phone and desktop activation and
unsupported-car behavior in Chromium and WebKit.

Viewport emulation and WebKit do not establish physical-phone performance or
screen-reader audio behavior. No models, textures, pipelines or external assets
were added for these interactions.
