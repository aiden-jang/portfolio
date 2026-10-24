# Dropdown styling

Reviewed the production build in Chrome at desktop, 768-pixel tablet and
320-pixel phone widths. Browser viewport review is not physical-device testing.

- Project jump and filter dropdowns share a clear rounded border, typography,
  arrow spacing and 44-pixel minimum height.
- Keyboard focus has a visible outline without clipping at the narrow phone width.
- Keyboard project selection, filtering and mobile section navigation still work.
- The mobile section menu has rounded corners and a matching visible border.
- Desktop and phone navigation and accessibility regressions passed in WebKit.

`desktop.jpg`, `tablet.jpg` and `phone.jpg` show the default controls.
`desktop-focus.jpg` and `phone-focus.jpg` show keyboard focus after selection or
filtering. `phone-menu.jpg` shows the open section menu.
