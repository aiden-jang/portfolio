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

## Recorded and illustrated examples

Iodine's local example records an actual snapshot, edit, revert and feedback queue
using its snapshot service. The example file is synthetic. Undo and Replay
switch the current file at the same line on desktop and phone. The scope control
shows the recorded decisions for an approved folder and a folder outside it.
The editor screenshot opens on the highlighted symbolic-link check. Fit image
shows the full editor and assistant. The case URL carries the edited or restored
state, the file reference focuses the line, and the source link opens the restore
implementation.

Bean's small artwork frames come from mrrp's native sit/perk renderer and eye painter.
The bloomnote garden uses its own flower renderer to recompose the three blooms from the
approved recipient capture. Selecting a flower shows its original meaning. The original
garden and full recipient note are available in the screenshot viewer.

Sources: [mrrp artwork](https://github.com/aiden-jang/mrrp/tree/23fb567/packages/web/src),
the [bloomnote recipient screenshot](../public/projects/bloomnote-garden.jpg), and the contribution
link in the Iodine example.

The iguess gallery replay draws a saved round stroke by stroke and displays the
recorded guess. With reduced motion, Play round displays the finished drawing and
guess immediately. The reader illustrates how the room socket, Durable Object and
AI Worker share a round. The portfolio runs both examples locally.

The wherever gallery opens with the group’s result and ranked backups. The second
shot shows Late Night Pizza Decisions mid-swipe. Both captures come from the same
local two-person round with sample restaurants. The platform gallery captures
the account hub and the signed-in worth archive from the same local test session.
The hub capture masks the test email. Swipe or select a step to move between
the recorded states. The screenshot inspector opens the uncropped frames.

Owewell's paired inspector captures come from the local calculator. Maya and Alex
split a sample $48 bill equally. Selecting a payer opens the matching screenshot.
In the screenshot viewer, selecting a point in the fitted image zooms around that
detail. Fit image restores the full frame.

## Showroom study

The [finished](../public/projects/showroom-finished.webp) and
[clay](../public/projects/showroom-clay.webp) images are matching captures from
the portfolio’s Studio renderer. Both use the Ferrari F40 by
[vecarz](https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95),
licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
The full clay frame comes into view before scrolling reveals paint from the nose.
The slider also supports manual control. Opening the shot in Studio and returning
preserves the slider and reading position. The About reel pairs local project captures
with a tighter mobile view for Iodine. It loops while in view and plays on request when
reduced motion is enabled.
