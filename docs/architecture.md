# Architecture

## Page and navigation

`src/App.tsx` composes the decorative scene, page chrome and content. It keeps the
scene behind a lazy-loading boundary so portfolio content can load independently.
`SceneBoundary` contains scene failures without replacing the page.

`useNavigation` owns scroll tracking, section jumps and event registration.
`scrollNavigation` owns the cancellable scroll animation. `navigationKeyboard`
routes keyboard actions and preserves native input and reading behavior.
`sectionProgress` maps actual section positions to camera progress. Section IDs
and labels share one definition in `config.ts`, used by navigation, dots and commands.

Scene visibility, section selection and control visibility have different rules.
The Contact car becomes visible when its section enters the viewport. Controls
and orbit hints require a complete Intro or Contact viewport. CSS visibility
updates on scroll without waiting for the active navigation section to change.

## Scene and state

`three/Scene.tsx` composes the canvas, models, lighting, floor and effects.
Effects have their own lazy-loading boundary inside the canvas, so their download
does not block mounting the scene or starting the model request. Rendering pauses
in reading sections and resumes for the visible Contact car.
`CameraRig` combines section poses, pointer offsets, intro motion and rev motion.
`useContactArrival` holds the front-facing opening pose, then advances the arrival
near the end of the Contact scroll. Reduced motion bypasses the arrival animation.
The composer and reflection target disable floating-point multisampling because it
produces blank targets in the tested WebKit engine. FXAA smooths the final scene
instead, including the reflection; DOM text is unaffected.

The Zustand store separates infrequently updated UI state from mutable scene
references. Frame updates mutate references rather than rerendering the page.
Car selection resets paint/material references through a shared store action.
`useSceneUrl` restores and synchronizes the selected car, paint and lighting;
`sceneLink` builds garage links; `browserSharing` handles native sharing, cancellation
and clipboard fallback. `useShareFeedback` owns request ordering, feedback timers
and invalidation when the active story or preview changes. Garage links preserve
case-study fragments.

`Car` owns asynchronous GLB loading and disposal. Models use meshopt compression,
auto-fit framing and paint-material detection. Adjacent models are prefetched
into the HTTP cache when network conditions permit. `carHelpers` owns geometry,
material detection and GPU-resource disposal. Scene cleanup releases model resources,
underglow geometry and textures, and the reflection target and material.

## Projects and dialogs

Project content lives in `src/data/`. Section components render that data rather
than owning product descriptions. `Sections` connects case-study selection to
browser history; `ScrollBody` maintains each story’s reading position.

Case studies, commands and credits share `useDialogFocus` for focus trapping and
restoration, and `usePageScrollLock` for background scroll locking. Screenshot and car browsers
use native dialogs for native modal focus behavior. A nested screenshot retains
its parent’s lock and returns focus to its trigger when closed.

## Styles

`index.css` defines the theme, shared foundations and global motion rules.
Component stylesheets own their interface rules. `reading-flow.css` owns reading
visibility. `reading-layout.css` owns responsive reading adjustments, and
`browsing-controls.css` owns preview and story scrolling controls.
`portfolio-surfaces.css` contains cross-section layouts and
surface refinements. Its rule order preserves the existing responsive cascade.
Avoid adding new files named after polish passes; change the relevant owner.

## Initial HTML and search metadata

`index.html` includes an HTML introduction, experience and contact links inside
`#root`. This is readable before JavaScript loads and when JavaScript is disabled.
`src/main.tsx` mounts the React app with `createRoot`, replacing that introduction;
the page is not server-rendered or hydrated.

The HTML head owns canonical, social and structured profile metadata. Employer
information is omitted from the structured profile and excluded from snippets with
`data-nosnippet` in initial and rendered content. `WorkModal` temporarily changes
the page title and description while a story is open and restores them on cleanup.
Case studies use URL fragments rather than separate server routes; the sitemap
lists the canonical homepage.

`public/` assets are copied to `dist/` by Vite. Vercel serves the built static site;
GitHub Actions runs verification and does not deploy. `vercel.json` sets immutable
caching for fingerprinted `/assets/` files. Analytics and Speed Insights mount in
`App`; the app has no portfolio backend.

## Validation

`npm run verify` covers source, content, unit tests and the production build.
`npm run test:browser` adds Chromium/WebKit interaction, rendering and accessibility
regressions against a fresh production preview. CI runs both;
[Quality checks](quality.md) describes setup and coverage. Repository checks enforce file ceilings,
comment constraints and a test floor. Tests cover math, state transitions, data
invariants and selected DOM behaviors. Layout, focus, browser history and scene
behavior also need browser checks; a green unit suite does not establish visual
fidelity or physical-device compatibility.

## Adding a car

Add the compressed model to `public/models/`, a matching JPEG preview to
`public/cars/`, and a specification with source attribution to `CARS` in
`src/config.ts`. Keep the default and adjacent models lightweight: those entries
are candidates for initial prefetch. Check framing, paint detection, disposal,
loading failure and attribution before committing. Verify both the publisher license
and any credited upstream sources using [the model license review](model-licenses.md).
Preserve embedded attribution, original material names and paint detection when
optimizing. Compare rendered desktop and phone views before accepting simplified
geometry; compressed file size alone does not establish visual fidelity.
