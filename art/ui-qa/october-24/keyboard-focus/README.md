# Keyboard focus

Reviewed the production build in Chrome at desktop and 320-pixel phone widths.
Viewport review does not establish physical-device behavior.

- Only the keyboard target has a strong car-card frame. The current car keeps
  its checkmark and Selected label without an additional selected border.
- A stationary pointer does not retain a competing highlight during keyboard use.
- The command menu uses the same neutral surfaces and corner shapes as the other
  dialogs, with one active row shared by pointer and keyboard navigation.
- Focus outlines use the interface's standard spacing.

`picker-desktop.jpg` and `picker-phone.jpg` show the F40 selected while keyboard
focus rests on the Mercedes. `commands-desktop.jpg` and `commands-phone.jpg` show
the matching command menu styling.

The regressions reproduced two emphasized car frames and two highlighted command
rows before the fix. The updated desktop and phone garage, navigation and
accessibility cases passed in WebKit.
