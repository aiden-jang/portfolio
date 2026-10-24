# Shortcut background sizing

Reviewed the production build in Chrome at desktop and 768-pixel tablet widths.
The background and border contain all shortcut groups, with 16 pixels of inner
padding at both ends. The All controls focus outline also fits inside the bar.
Opening and dismissing the command menu remains functional.

The shortcut legend owns its content-based width, padding, border and background
in one stylesheet. It can wrap groups when space is constrained instead of
shrinking their labels. Its existing phone and short-viewport visibility rules
remain in effect.

`desktop.jpg` shows the full page, `detail.jpg` crops the two control bars for
readability, and `tablet-focus.jpg` shows keyboard focus after dismissing the menu.
Browser viewport review does not establish physical-device behavior.
