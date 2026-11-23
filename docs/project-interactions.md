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
automatic orbit. Done restores the still. Vertical swipes and the mouse wheel
scroll the page. The renderer pauses offscreen, behind a dialog and in a hidden
tab. Reduced motion keeps the still until the visitor chooses Explore globe and
turns off both automatic rotation and coasting.

The public assets contain all data needed by the embedded globe. The
[USGS snapshot](../public/projects/orbit-snapshot.json) holds 194 magnitude 5.0+
earthquakes, and the featured Kamchatka event comes from the reconciliation
fixture above. Event links carry the selected USGS ID and camera to the live app.
Older events can age out of its catalogue.

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

## Showroom case study

About links to the [showroom case study](../cases/showroom/index.html). It uses desktop
and phone recordings of the actual F40 opening, with chapter markers for the poster,
first live frame and first drag. The slow-load replay includes an intentional hold on the
model request. The edited handoff view starts shortly before the first live frame. The clips
illustrate the handoff and do not measure network or physical-device performance.

## Project scenes

The Iodine gallery crossfades between real captures of a reused terminal approval and
a fresh approval request. The case study keeps the recorded snapshot, Undo and Replay,
editable-state link and clickable file reference. Its scope control switches between the
recorded decisions for the approved folder and a folder outside it.

The mrrp scene uses Bean’s native room canvas with controls to pet Bean, sit together
and switch the lighting. The room also changes light as the visitor scrolls. The
renderer loads near the viewport and releases its canvas offscreen. The portfolio room is silent and uses local examples. To rebuild the checked-in
renderer, run `node scripts/vendor-mrrp.mjs /path/to/mrrp` with a clean checkout of
[the pinned revision](https://github.com/aiden-jang/mrrp/tree/23fb567d2a430db8eda47ff4011abccd8030ae5a).
The original [MIT license](../public/projects/mrrp-license.txt) ships with the renderer.

Scroll through iguess to draw one recorded round, reveal the guess and see the answer.
Scroll back to retrace the same strokes. The case study shows
how the room socket, Durable Object and AI Worker share a round.

The dinner scene keeps the same pizza in view as Alex and Maya’s wherever vote
becomes a match and the $48 owewell receipt arrives. Scrolling back reverses the
sequence. Reduced motion shows the match and receipt in order and leaves the
iguess drawing in its finished state.

The bloomnote garden recomposes three blooms from the
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
The full clay profile holds before the camera turns toward the rear, reveals the
red paint and rises over the louvers in one take. Scrolling in either direction
scrubs the recorded turn. The slider supports
manual control and blends between stills with reduced motion. Opening the shot
in Studio and returning preserves the reading position. The About reel pairs local project captures
with a tighter mobile view for Iodine. It loops while in view, is tappable to pause, and
plays on request when reduced motion is enabled.
