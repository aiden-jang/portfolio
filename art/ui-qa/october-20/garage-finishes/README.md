# Signature garage finishes

Production-preview captures from the paint-palette review on October 20, 2026.
The Ferrari keeps its authored red. Each other car receives a distinct default:
silver blue for the Mercedes, deep jade for the Supra, Bordeaux for the RWB,
Atlantic blue for the BMW, burnt copper for the Datsun and golden yellow for the Countach.

[Lineup](lineup.jpg) shows the refreshed picker-preview images captured from the
actual models. [Desktop review](desktop-review.jpg) and
[phone review](phone-review.jpg) show each default in Dusk and Night lighting.
[Capture results](review.json) record the reviewed viewports and finishes.
The final picker was also checked at [desktop](picker-1440.jpg),
[tablet](picker-768.jpg) and [phone](picker-390.jpg) widths for preview loading,
finish labels, horizontal overflow and focus restoration after closing.

The review used WebKit at desktop and narrow-phone widths, reduced motion, a
New York time zone and a fixed afternoon clock. Opening the native car picker
paused rendering for stable captures; capture-only styles hid that dialog.
Thumbnail captures also hid the page controls without changing model rendering.
The picker previews use Dusk lighting and retain the scene reflections.

Checks covered each default label, horizontal overflow, model loading and browser
errors. Additional Countach checks covered Graphite, resetting to Golden Yellow,
and reopening an older explicit blue paint URL. Automated interaction coverage
checks desktop swatch selection, phone paint cycling, default restoration and
picker image loading in Chromium and WebKit. Viewport emulation does not establish
physical-phone compatibility.
