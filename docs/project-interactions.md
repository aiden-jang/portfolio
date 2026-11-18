# Project interactions

The showcase keeps approved screenshots available beside small, self-contained interactions.
The entire car garage remains separate from the project globe.

## Globe

The featured still marks an August 2026 Kamchatka earthquake from real USGS and EMSC
readings recorded in Everything Is Fine’s reconciliation fixture. Inspect an earthquake
shows both agencies’ readings without WebGL. The event case study uses the same evidence.
The still renders the existing Natural Earth mesh, coastlines, and tectonic boundaries.
The app’s [recorded agency reports](https://github.com/aiden-jang/everythingisfine/blob/main/src/sources/fixtures/one-quake-both-feeds.json)
include the source IDs, original precision and measured separation.

Explore globe starts the interactive USGS snapshot on request. Done restores the
Kamchatka still and ordinary page scrolling. Mouse wheel input scrolls the page. Dragging, arrow keys, reset and event
selection stay inside the globe. Motion stops when the globe is idle, offscreen,
behind a dialog or in a hidden tab. Reduced motion removes coasting.

The recorded USGS snapshot in `public/projects/orbit-snapshot.json` supplies marker
positions, magnitude, depth, event names and times. Its capture date is displayed;
it does not poll or imply a live feed. Event links preserve the selected USGS event
and camera in the actual application's permalink format. Older events can age out
of that application's live catalogue.

The geography asset uses everythingisfine's Natural Earth land mesh, coastlines,
tectonic boundaries and graticule. Its indexed geometry uses the native adaptive
edge cap, with fewer uniform subdivision passes for a small embedded globe. The
layout of its compressed arrays is in `src/data/globeGeometry.json`. The loader
handles hosts that automatically decompress gzip as well as hosts serving the stored
bytes. The renderer reuses the portfolio's Three.js dependency and disposes of its
context, observers, input listeners and materials when closed.

Source: [everythingisfine globe and geography](https://github.com/aiden-jang/everythingisfine/tree/b61b661/src).
The embedded scene adapts its surface lighting, atmosphere, magnitude sizing,
thermal palette and depth holes; it does not bundle the full application.

## Recorded and illustrated examples

Iodine's local example records an actual snapshot, edit, revert and feedback queue
using its snapshot service. The example file is synthetic. Undo and Replay switch
between those recorded contents. Play recorded example shows the edited file and
restores it after a short interval, preserving keyboard focus. Its timer stops
when the component unmounts. No live agent runs or edits visitor files.
Desktop shows the agent edit beside the saved snapshot or restored file. Phones show
the current file. The original editor screenshot opens from its own link. The case
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
