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
Section resize observation refreshes scene and control visibility when initial
layout or content sizing settles without a scroll event, including WebKit reloads.

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
produces blank targets in the tested WebKit engine. SMAA smooths the final scene
instead, including the reflection; DOM text is unaffected.

The Zustand store separates infrequently updated UI state from mutable scene
references. Frame updates mutate references rather than rerendering the page.
Car selection resets paint/material references through a shared store action.
Each car declares a named default finish in `cars.ts`; the Ferrari retains its
authored red. `paint.ts` owns the complementary swatches, color labels and strict
hex parsing. The existing `paint=original` URL token restores the selected car's
curated default; explicit six-digit hex links remain usable after palette updates.
Desktop swatches and mobile cycling share the same seven choices without duplicate
colors. A `fixedLivery` car retains its authored finish: paint controls, repaint
commands and paint shortcut hints are hidden; color actions, shared links and
randomization preserve its original livery. Picker previews show each car's default finish.
`useSceneUrl` restores and synchronizes the selected car, paint and lighting;
`sceneLink` builds garage links; `browserSharing` handles native sharing, cancellation
and clipboard fallback. `useShareFeedback` owns request ordering, feedback timers
and invalidation when the active story or preview changes. Garage links preserve
case-study fragments.

`Car` owns asynchronous GLB loading and disposal. Models use meshopt compression,
auto-fit framing and paint-material detection. Cars with ambiguous material
layouts can declare an exact `paintMaterial` name; a missing explicit target disables
paint instead of selecting an unrelated surface. The 917K targets its textured body
panels so wheel, chassis and trim materials retain their authored colors. The added
road cars target explicit paint materials. The GT3 RS replaces the standard GT3
in the picker with a new permanent identity; existing GT3 links keep their car.
Its textured wrap and carbon remain fixed, with flat aero meshes preserved and
no authored animation clips. It is loaded only on selection, outside the small
arrival prefetch pool. The F1-75 replaces the 296 GT3 in the
picker; both keep permanent registry identities for shared URLs. The selected vecarz
Aimgain R35 replaces the modified A90 Supra in the picker, with that Supra retained
for existing links. Its source body color, separate wheel/trim materials and flat
splitter meshes are preserved, and repaint targets only its named body material.
That body receives lower roughness and a smooth clearcoat for glossy reflections,
retaining its color, metalness and maps. Race cars preserve
flat splitter and floor meshes that could resemble a baked ground plane; both F1
cars omit synthetic road lights.
The 296 GT3 declares an orientation offset to normalize its diagonal source pose
before length fitting and grounding. `modelFinishes` keeps the 296's printed livery
in front of its coplanar shell and corrects its body/glass metalness for the studio
lighting without changing textures or wheel finishes. The Aventador's named body
paint receives a physical clearcoat and lower roughness; its color, texture maps,
wheel and trim materials remain intact. The other road-car finish profiles target verified body material names, cap base
roughness at 0.24 and add a smooth clearcoat while preserving sharper authored
coats, colors, metalness and maps. The GT3 already has sharp paint and retains its
authored finish. The F1-75 keeps its source racing textures
while correcting metallic paint, decal, carbon and tire responses for studio lighting.
The Countach targets `Meshpart19Mtl` for Giallo paint and glossy dielectric
clearcoat. Its separate `Meshpart2Mtl` rubber loses the export's metallic coat;
repainting leaves wheels, rubber, trim and glazing untouched. Flat meshes are
retained, and the selected export supplies no animation clips.
`popupHeadlights` samples the
Miata's authored opening clip between its closed and raised poses; its Lights button
reverses travel, starts raised on selection and snaps poses for reduced motion.
The bulb materials emit warm light while raised; lens-mounted point lights follow
the hinges and replace the Miata’s fixed front lights. Both fade with the opening
pose. The controller restores cloned bulb materials and removes its lights when
the model is replaced, alongside releasing animation bindings. Framing measures actual world-space
vertices once on load so rotated mesh bounds do not lift cars off the floor. Only
the default car and the smallest companion warm the HTTP cache when network conditions permit;
heavier full-detail cars load on selection. `carHelpers` owns geometry,
material detection and GPU-resource disposal. Scene cleanup releases model resources,
underglow geometry and textures, and the reflection target and material.

Lighting combines the themed key/fill/rim lights with a locally generated, low-intensity
studio environment for readable metallic surfaces. Effects bloom in HDR, then apply
ACES tone mapping and SMAA. Keep tone mapping before edge smoothing. Thin glazing uses alpha
transparency with its authored tint and opacity instead of multisampled refraction
targets for the main view and its reflection. Multisampling
stays off for WebKit compatibility. The scene stops drawing continuously behind
open dialogs and in hidden tabs, resuming when the car becomes available again.
Reduced-motion scenes render around input, model loading and layout changes, then
rest instead of drawing identical frames continuously. Model readiness is reported
after its first rendered frame.

The `?clean` capture mode keeps the scene visible without section bounds or page
chrome, with a fixed camera. Use it for model previews; normal browsing continues
to derive visibility from actual section positions.

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
`public/cars/`, and append a specification to the stable registry in `src/cars.ts`.
Put attribution in `src/data/carCredits.json`. Never reorder registry IDs: numeric
shared URLs resolve through that registry, including retired cars. `GARAGE_INDICES`
defines the visible order for the picker, previous/next, number shortcuts, commands,
randomization and captions. Add the new ID there; removing an ID retires it from
selection without breaking old links. Keep the default and the explicit prefetch pool lightweight;
full-detail models load only when selected. Check framing, paint detection, disposal,
loading failure and attribution before committing. Verify both the publisher license
and any credited upstream sources using [the model license review](model-licenses.md).
Preserve embedded attribution, original material names, paint detection, source
mesh detail, normals and texture pixels when optimizing. Compare rendered desktop
and phone views; compressed file size alone does not establish visual fidelity.
