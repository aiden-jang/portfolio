# Miata lamp illumination

The pop-up lamps emit warm white light while raised. Their light sources sit just
outside the two lens surfaces and move with the authored hinge animation. Brightness
follows the opening pose, fades out before the lights close, and snaps with the pose
for reduced motion. The Miata's generic fixed front lights are omitted; taillights
and other cars retain their existing lighting.

[Desktop at night](desktop-on.jpg) shows the round lamps illuminating and reflecting
in the floor. [Clean dusk capture](clean-on.jpg) supplies the refreshed picker preview.
Phone captures show the existing Lights control with [raised/lit lamps](phone-on.jpg)
and [lowered/off lamps](phone-off.jpg), also shown in the [comparison](comparison.jpg).

Regression fixtures read the actual compressed Miata lens geometry and animation.
They check paired lights, hinge following, intermediate brightness, endpoint states,
original material preservation, disposal, and retaining taillights when generic front
lights are omitted. A temporary zero-emission mutation made the bulb regression fail;
the restored implementation passes. Repository verification and focused garage browser
checks run separately so a rebuilding preview cannot interrupt an active browser test.

This review uses desktop browser viewport emulation. Physical-phone GPU behavior and
screen-reader audio are not covered.
