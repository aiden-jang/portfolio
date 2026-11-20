# Project interactions

The showcase keeps approved screenshots available beside small, self-contained interactions.
The entire car garage remains separate from the project globe.

## Globe

The featured still marks an August 2026 Kamchatka earthquake from real USGS and EMSC
readings recorded in the meanwhile. reconciliation fixture. Inspect an earthquake
shows both agencies’ readings without WebGL. The event case study uses the same evidence.
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

## Recorded and illustrated examples

Iodine's local example records an actual snapshot, edit, revert and feedback queue
using its snapshot service. The example file is synthetic. Undo and Replay switch
between those recorded contents. Play recorded example shows the edited file and
restores it after a short interval, preserving keyboard focus. Its timer stops
when the component unmounts. No live agent runs or edits visitor files.
Desktop shows the agent edit beside the saved snapshot or restored file. Phones show
the current file. The editor screenshot opens on the highlighted symbolic-link
check. Fit image shows the full editor and assistant. The case
study opens with the same recorded edit and highlights the changed expression.

Bean's small artwork frames come from mrrp's native sit/perk renderer and eye painter.
The bloomnote spread crops the garden and Gerbera from the approved recipient screenshot and
shows the flower’s original meaning. The full garden and note are available in the screenshot viewer.

Sources: [mrrp artwork](https://github.com/aiden-jang/mrrp/tree/23fb567/packages/web/src),
the [bloomnote recipient screenshot](../public/projects/bloomnote-garden.jpg), and the contribution
link in the Iodine example.

The iguess reader illustrates Draw → Share → Guess. It describes the existing
room socket, Durable Object and AI Worker architecture; it sends no drawing or
AI request. Controls remain usable with reduced motion.

The wherever gallery pairs two browser captures from a local two-person room
using sample restaurants and the app's teaser photo. Both participants voted
for the restaurant shown on the result screen. The platform gallery captures
the account hub and the signed-in worth archive from the same local test session.
The hub capture masks the test email. Both galleries open the uncropped frames.
