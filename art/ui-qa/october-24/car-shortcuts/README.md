# Car command hints

The [desktop](desktop.jpg) and [phone](phone.jpg) captures show the production build
in Chrome with the command menu filtered to Porsche. The RWB retains its valid
single-key shortcut, 7. The GT3 RS, beyond the first nine positions, shows Select
rather than a nonexistent two-digit shortcut. Other later cars follow the same rule.

The car order and numeric captions remain unchanged. Cars beyond the first nine
remain available through the picker, command search and previous/next controls.
The unit regression rejects the old numeric hint, and the existing interface
browser checks cover the rendered later-car hints, dialog access and focus.
No new browser cases or CI jobs are added. Phone review uses viewport emulation;
physical-device and screen-reader audio checks were not performed.
