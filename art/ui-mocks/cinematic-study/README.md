# Cinematic showroom motion study

The approved study is implemented in the production application for desktop and
mobile. This review entry point reuses that application with replay and jump
controls outside the portfolio; production does not import those review tools.

Build the preview with `npx vite build --config vite.opening-orbit.config.ts`, then
serve it with `npm run preview -- --config vite.opening-orbit.config.ts` and open
`/art/ui-mocks/cinematic-study/review.html` on port 5199. Use **Replay opening orbit**
to replay the preview’s single sweep. The camera travels 26° on desktop and 20° on
phones in about 2.4 seconds after the car is ready, then stops on the existing angle.
Drag or scroll to take over sooner. Reduced motion starts at the settled angle.
During the desktop sweep, the preview brings the car silhouette in front of the
lower edge of the name. The heading returns to its usual position as the car
settles. Phone and reduced-motion layouts keep the full name visible throughout.

Use **Replay first scroll** to see the camera and type handoff, or the moment buttons
to jump to Opening, Handoff, Globe and Iodine. These are review tools.
The review frame switches between desktop and phone sizes. Normal scrolling
remains available; wheel, touch and keyboard input interrupt replay.

Desktop uses a larger name and work title with the existing Geist/charcoal/ivory
identity. The car stays still at rest and remains orbitable in the full garage.
The first scroll uses the existing camera path, a deliberate fade and larger incoming
typography. The globe retains its existing recorded data, event links and interaction.
Phones have separate title sizes, stacking, contribution framing and a more distant
camera during the handoff to keep the side silhouette in view.

The production Dusk lighting uses a weaker key, stronger fill and rim, and a quieter
reflection/bloom. It keeps the existing car model and environment. Contact retains
its fixed camera. Existing project details, links, screenshots and garage controls
are reused from the current application.

The Iodine stage animates the synthetic greeting file from the existing recorded
snapshot/revert example. **Play recorded example** shows the edit and restore;
Undo and Replay also work directly. No agent runs and no visitor files change.
It is an explanatory presentation of recorded state, not a video of the IDE.

This study does not yet contain new footage from the other applications, a custom
AJ wordmark or a redesign of the remaining sections. Motion judgment requires trying
the live preview; still captures document the key compositions. Desktop and phone
browser sizes are useful evidence but do not establish physical phone performance.
