# Aventador paint finish

The Aventador's `RED_PAINT` material gains a physical clearcoat and lower roughness.
Its existing green default, metallic response, texture maps, geometry, wheels,
carbon trim and glass retain their source settings. Shared body materials reuse one
replacement, and the replaced material is disposed without disposing its textures.

The [before](before.jpg) and [after](after.jpg) captures use the same clean camera,
dusk theme and afternoon sun position. Only these temporary comparison builds pin
the sun to 14:00; production continues following the visitor's local time.
The [side-by-side comparison](comparison.jpg) puts the body highlights together.
The [phone review](phone.jpg) shows the result in the normal portfolio interface.
The picker preview uses the updated finish.

Repository verification covers the physical shader, original surface properties,
shared materials, untouched trim and repeat preparation. Removing the clearcoat
made the new regression tests fail; restoring it passed. Focused Chromium and
WebKit checks exercise repainting, shared links, picker behavior and floor
reflections. They use a fresh preview of the verified production build, avoiding
an additional build after local server-start timeouts. CI configuration is unchanged.

These captures use desktop browser viewport emulation. Physical-phone GPU behavior
has not been verified.
