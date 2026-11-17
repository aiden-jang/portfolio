# Project interactions

The showcase keeps approved screenshots available beside small, self-contained interactions.
The entire car garage remains separate from the project globe.

## Globe

The globe starts when its featured image becomes visible on desktop. On touch screens,
visitors choose Explore globe first; Done restores the screenshot and ordinary page
scrolling. Mouse wheel input scrolls the page. Dragging, arrow keys, reset and event
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
between those recorded contents; no live agent runs or edits visitor files.
The contributor label and screenshot remain available.

Bean's small artwork frames come from mrrp's native sit/perk renderer and eye painter.
The flower uses bloomnote's native Gerbera petal and seed geometry, with the meaning
from the approved garden. These assets preserve the app artwork without depending
on neighboring repositories at build time.

Sources: [mrrp artwork](https://github.com/aiden-jang/mrrp/tree/23fb567/packages/web/src),
[bloomnote flower](https://github.com/aiden-jang/bloomnote/blob/9fccd54/packages/web/src/components/BotanicalFlower.tsx),
and the contribution link in the Iodine example.

The iguess reader illustrates Draw → Share → Guess. It describes the existing
room socket, Durable Object and AI Worker architecture; it sends no drawing or
AI request. Controls remain usable with reduced motion.
