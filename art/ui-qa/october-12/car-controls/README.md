# Car interaction and screenshot viewer

Inspected selected lighting and zoomed screenshot controls at desktop 1440 and phone
widths 390 and 320. Phone lighting has a visible current label beside paint. Screenshot
zoom begins centered horizontally, keeps Close and Fit reachable, and exposes a
keyboard-scrollable image region. Escape returns focus to the originating thumbnail.

Browser gesture checks dispatch touch pointer events against the loaded app: movement
past the hold tolerance cancels tap-to-rev, a stationary tap revs, holding engages orbit,
and release clears orbit state. Native finger scrolling still benefits from a real-device
check; synthetic browser events verify the gesture handlers rather than device feel.

Removed intentional paint-button blur and the car-dependent group remount so keyboard
focus is not deliberately discarded by car changes. Inputs and screenshot dialogs are
excluded from the orbit gesture region.
