# Contact return transition

Local production preview reviewed in Chrome on October 24, 2026, with normal
motion at requested viewports of 1440 × 900 and 390 × 900.

The desktop and phone sequences show the Contact pose, an intermediate departure
angle after scrolling upward a quarter viewport, and the settled front-facing
opening pose. The departure and opening captures hold the same scroll position;
the camera continues moving after the scroll stops. Navigation back into Contact
retains its front-to-overhead arrival. Car controls remain hidden in Contact.

The camera regression checks continuity when leaving the arrival zone, progress
clamping, changing direction partway through, and immediate reduced-motion poses.
It failed against the earlier reset behavior before the fix was applied.

These stills record the reviewed poses, not frame-by-frame animation smoothness.
Physical-phone performance was not checked.
