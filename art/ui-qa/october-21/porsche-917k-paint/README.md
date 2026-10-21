# Porsche 917K paint review

The automatic material scorer selected `material_4`, which covers non-body parts,
instead of the textured `body` panels. The 917K now declares an exact paint target;
other cars retain automatic discovery. A missing declared target disables paint
rather than selecting a different surface.

The regression test reconstructs the selected GLB's real mesh bounds, node
hierarchy, material references, colors and texture presence. It reproduced the
incorrect target before the fix and now checks that repainting the body preserves
every other material color. The model file, geometry, texture pixels and authored
material response are unchanged.

Browser review covers [the original red livery](original.jpg),
[blue paint on desktop](blue.jpg) and [mobile paint cycling](phone.jpg).
Changing paint updates the shared URL; restoring the default restores the original
red livery. Wheels, wheel wells and frame retain their authored material colors;
lighting and reflections can still affect their rendered appearance.

The initial captures use the local development preview. A [production capture](production.jpg)
checks a shared custom-paint URL against the built application. Viewport emulation does not establish
physical-device performance or Safari behavior on an actual iPhone.
