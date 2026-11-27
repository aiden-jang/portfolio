# Project interactions

The showcase keeps approved screenshots available beside small, self-contained interactions.
The entire car garage remains separate from the project globe.

## Globe

The featured still marks an August 2026 Kamchatka earthquake from real USGS and EMSC
readings recorded in the meanwhile. reconciliation fixture. Compare the Kamchatka
reports shows both depths without WebGL. Selecting an agency carries that reading
into the shareable case study. Back returns to the globe and the comparison control.
The still renders the existing Natural Earth mesh, coastlines, and tectonic boundaries.
The app’s [recorded agency reports](https://github.com/aiden-jang/meanwhile/blob/main/src/sources/fixtures/one-quake-both-feeds.json)
include the source IDs, original precision and measured separation.

As Featured work comes into view, the still gives way to a slow orbit from the
same camera position. Pause, drag, arrow keys and event selection stop the
automatic orbit. The opening orbit has time to play before the camera follows
scroll into the Kamchatka reading. Done restores the still. Vertical swipes and the mouse wheel
scroll the page. The renderer pauses offscreen, behind a dialog and in a hidden
tab. Reduced motion keeps the still until the visitor chooses Explore globe and
turns off both automatic rotation and coasting.

The public assets contain all data needed by the embedded globe.
The [USGS snapshot](../public/projects/atlas-events.json) contains 600 recorded
earthquake reports through 17 November 2026. The featured Kamchatka event uses
the reconciliation fixture above. Event links carry a selected USGS ID and camera
to the live app. Older events can age out of its catalogue.

The wider scene layers [NOAA GFS wind](../public/projects/atlas-wind.json) valid
6 November 2026 at 12:00 UTC and [RainViewer](https://www.rainviewer.com/) radar
recorded 24 November 2026 at 01:10 UTC. The layers come from separate dates and
recede as the globe focuses on Kamchatka and reveals both recorded depths beside its marker.

The day–night boundary, stars and aurora use the same recorded sky time,
17 November 2026 at 23:00 UTC. The aurora is a 2° grid sampled from a saved NOAA
SWPC OVATION forecast. The stationary stars are projections of the Yale Bright
Star Catalogue from the table bundled with the meanwhile. observatory. The opening WebP files
are lossless captures from the embedded scene at 1120 × 732 and 390 × 440. The
poster and the canvas share a frame at each breakpoint.

The geography asset from meanwhile. includes the Natural Earth land mesh,
coastlines, tectonic boundaries and graticule. The layout of its compressed
arrays is in `src/data/globeGeometry.json`. The loader supports hosts that
automatically decompress gzip and hosts serving the stored bytes. The
renderer uses the portfolio's Three.js dependency and disposes of its context,
observers, input listeners, textures and materials when closed.

Sources: [meanwhile. geography](https://github.com/aiden-jang/meanwhile/tree/b61b661/src),
[star catalogue](https://github.com/aiden-jang/meanwhile/blob/main/src/geo/stars.json),
and [NOAA SWPC aurora forecast](https://www.swpc.noaa.gov/products/aurora-30-minute-forecast).

## Project scenes

Iodine loops the agent edit and restored line in the same editor frame while visible.
Using Undo edit takes control of the demo. The case study includes the screen recording and restores the
source frame, scroll position, and focus on Back. Reduced motion shows the result
immediately and keeps the recording on demand.

The mrrp scene uses Bean’s native room canvas. Visitors can pet Bean, drag the toy
mouse, and invite her into the box. The room also responds to keyboard input. On
supported viewports, the finished iguess drawing becomes Bean and jumps as the
room opens beneath her. A direct link to Bean’s room lands in the room. Reduced
motion presents the two scenes in reading order.

The canvas loads near the viewport and unmounts when it leaves. Reduced motion uses
still reactions. The room is silent and uses local examples. To rebuild the checked-in
renderer, run `node scripts/vendor-mrrp.mjs /path/to/mrrp` with a clean checkout of
[the pinned revision](https://github.com/aiden-jang/mrrp/tree/23fb567d2a430db8eda47ff4011abccd8030ae5a).
The script applies the [room patch](../scripts/patches/mrrp-room.patch) to a temporary copy.
The original [MIT license](../public/projects/mrrp-license.txt) ships with the renderer.

The iguess scene draws a cat round and holds the answer before restarting.
Visitors can take over the drawing while it is playing. The worth preview moves Goose Island IPA ahead of
Brooklyn Kura Sake Junmai and holds the verdict. These demos pause offscreen and
in hidden tabs. Reduced motion shows their finished states.

The dinner scene keeps the same pizza in view as Alex and Maya’s wherever vote
becomes a match and the $48 owewell receipt arrives. It runs once and holds the
bill on return. The saved owewell link goes straight to the receipt. Reduced
motion shows the match and receipt together.

The request-batching diagram gathers 120 marks into one moving pulse as the visitor
scrolls, including in short windows. After a fast landing, the marks merge once the diagram
is in view. With reduced motion, it shows the single request and 2s load time immediately.

The bloomnote garden reveals its three blooms once, then holds the view from the
[approved recipient capture](../public/projects/bloomnote-garden.jpg). Selecting a flower
shows its meaning. The screenshot viewer includes the garden and the full note.
The platform gallery shows the account hub and signed-in worth archive from the same
local test session, with the test email masked.

## Showroom study

The [desktop](../public/showroom/finish-study/desktop.mp4) and
[mobile](../public/showroom/finish-study/mobile.mp4) studies use the portfolio’s
Studio renderer and the Ferrari F40 by
[vecarz](https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95),
licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
The clay-to-paint study settles into an elevated front three-quarter view. Contact holds that same
view as the email appears. The desktop recording and phone image sheets follow the same
move while the live model loads. The scrubber supports manual control and uses stills
with reduced motion. The painted still is shared with Contact.
The About reel pairs local project captures
with a tighter mobile view for Iodine. It loops while in view,
pauses while held and plays on request when reduced motion is enabled.
