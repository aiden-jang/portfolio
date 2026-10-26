# Architecture

## Page and navigation

`src/App.tsx` composes the decorative scene, page chrome and content. It keeps the
scene behind a lazy-loading boundary so portfolio content can load independently.
`SceneBoundary` contains scene failures without replacing the page.

`useNavigation` owns scroll tracking, section jumps and event registration.
`scrollNavigation` owns the cancellable scroll animation. `navigationKeyboard`
routes keyboard actions and preserves native input and reading behavior.
Direct car keys cover positions 1–9; later cars show a Select action in the command
menu and remain reachable through search, the picker and previous/next controls.
`sectionProgress` maps actual section positions to camera progress. Section IDs
and labels share one definition in `config.ts`, used by navigation, dots and commands.
Section resize observation refreshes scene and control visibility when initial
layout or content sizing settles without a scroll event, including WebKit reloads.
Phones use the persistent header menu for section navigation; the progress-dot rail
is desktop-only. Model-loading feedback sits below the shared header height, clear
of Menu and Résumé. Keyboard hints appear only in wide layouts with a fine primary
pointer; shortcuts still work with an attached keyboard. All controls has a visible
Close button on every screen, and sharing feedback stays visible on touch screens.

Scene visibility, section selection and control visibility have different rules.
The Contact car becomes visible when its section enters the viewport and keeps
its automatic arrival animation. Controls and orbit hints require a complete
Intro viewport. Contact rejects car gestures while leaving its copy and links
interactive. Scene visibility and gesture eligibility use separate predicates.
CSS visibility updates on scroll without waiting for the active navigation
section to change.

Contact makes the email address its main link, with an adjacent copy action and
secondary social links. Model credits open from the section footer. `ui/contact.css`
owns this layout and its feedback spacing. Copy is centered over the car on desktop
and phones, with a soft radial scrim keeping the text readable over reflections.
Symmetric section padding keeps it centered while clearing the header and credits;
short phones bring the car closer so its silhouette surrounds the copy. The
arrival and reversal use the same progress.
The camera projection follows Contact's document position while neighboring
sections share the viewport, then clears its offset outside Contact. This keeps
the previous reading surface from cutting through the car during a transition.

`CarControls` gives paint, lighting and optional interactions stable sizes while
they are in use. Unsupported interactions collapse, and fixed-livery cars use a
compact label. The bar adapts when switching cars without reserving empty slots;
label, icon, loading and feedback changes do not move neighboring controls.
The picker, paint, lighting and details share one panel with consistent control
corners and utility type. Phone controls occupy a second row inside that panel;
picker text truncates within fixed-height rows. The floating duplicate car caption
is omitted. Header actions and project selectors share the same control tokens.
Reading sections use content-led heights, matching heading sizes and clearer
metadata; the default project list avoids repeating an ownership label on every card.

The car picker distinguishes the current selection from keyboard focus: its check
and Selected label identify the loaded car, while only the keyboard target receives
a focus frame. Browsing does not change the car until activation. The command menu
uses one active result for both pointer and keyboard navigation, without retaining
a hover highlight on the previous result.

## Scene and state

`three/Scene.tsx` composes the canvas, models, lighting, floor and effects.
Effects have their own lazy-loading boundary inside the canvas, so their download
does not block mounting the scene or starting the model request. Rendering pauses
in reading sections and resumes for the visible Contact car.
`CameraRig` combines section poses, pointer offsets and intro motion. Manual orbit
holds the chosen angle until Reset view; automatic intro rotation resumes after a
reset. Reset appears outside the dock's layout so its arrival does not move the
other controls. Share and randomization live in All controls alongside keyboard
navigation. The primary dock keeps car selection, paint, lighting and available
model-specific details. Film grain is static.
`carHitTest` raycasts only the loaded model, excluding hidden meshes. A tap on the
car briefly boosts its existing lamps without camera shake or a floor-glow pulse;
empty intro space does not trigger it. Cars without road lamps omit this response.
The command menu provides the same light response without requiring a pointer.
`useContactArrival` holds the front-facing opening pose, then advances the arrival
near the end of the Contact scroll. Scrolling back toward About reverses the same
progress instead of resetting the camera while Contact is still visible. Changing
direction partway through continues from the current pose. Reduced motion bypasses
the arrival and departure animation.
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

`Car` owns asynchronous GLB loading and disposal. `carHelpers` handles world-space
vertex fitting, material detection, baked-plane handling and resource cleanup.
Retired models release shared geometry, materials, textures and decoded image
bitmaps once each; GPU texture disposal alone does not release decoded images.
`modelFinishes` applies verified, material-specific finish corrections without
changing geometry or texture detail. Cars with ambiguous paint surfaces declare a
material name; a missing explicit target disables repainting instead of selecting
an unrelated surface. Fixed-livery models omit paint actions.

`popupHeadlights` samples the Miata's authored opening clip and keeps its warm bulb
materials and hinge-mounted lights in sync with the pose. `carDetails` moves each
F1 model's existing DRS joint; those movements are runtime animations, rather than
supplied clips. `useCarDetails` resets and disposes these interactions on selection
changes. Reduced motion snaps detail poses.

The stable car registry and curated picker order are separate. Retired cars retain
their original IDs, models and credits for existing shared links. The default car
and the smallest companion warm the HTTP cache only when the browser reports a
fast connection without data saving; missing connection information disables
these optional downloads. All other models load only on selection. Per-model source,
licensing, optimization and material decisions live in
[the model license review](model-licenses.md).

Lighting combines the themed key/fill/rim lights with a locally generated, low-intensity
studio environment for readable metallic surfaces. Effects bloom in HDR, then apply
ACES tone mapping and SMAA. Keep tone mapping before edge smoothing. Thin glazing uses alpha
transparency with its authored tint and opacity instead of multisampled refraction
targets for the main view and its reflection. Multisampling
stays off for WebKit compatibility. The scene stops drawing continuously behind
open dialogs and in hidden tabs, resuming when the car becomes available again.
Shader diagnostics stay enabled in development; production skips synchronous
shader-log reads without changing shaders, materials or rendering quality.
Reduced-motion scenes render around input, model loading and layout changes, then
rest instead of drawing identical frames continuously. Model readiness is reported
after its first rendered frame.

The `?clean` capture mode keeps the scene visible without section bounds or page
chrome, with a fixed camera. Use it for model previews; normal browsing continues
to derive visibility from actual section positions.

## Projects and dialogs

Project content lives in `src/data/`. Section components render that data rather
than owning product descriptions. `Sections` connects case-study selection to
browser history; `ScrollBody` maintains each story’s reading position. Case-study
opening and history-driven closing share the native view transition when available.
Duplicate history events do not restart it, and superseded callbacks cannot restore
an older story or clear a newer transition’s target.

Case studies, commands and credits share `useDialogFocus` for focus trapping and
restoration, and `usePageScrollLock` for background scroll locking. Screenshot and car browsers
use native dialogs for native modal focus behavior. A nested screenshot retains
its parent’s lock and returns focus to its trigger when closed.

## Styles

`index.css` owns theme tokens, fonts, base accessibility styles and shared motion.
Component imports own their layouts and responsive rules; avoid adding a later
stylesheet to override an earlier styling pass. Paths below are relative to `src/`.

| Owner                                                                            | Responsibility                                              |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `ui/sections/intro.css`, `ui/sections/about.css`, `ui/sections/experience.css`   | Section copy, layout and responsive composition             |
| `ui/contact.css`                                                                 | Centered Contact composition, email feedback and footer     |
| `ui/portfolio-header.css`                                                        | Shared header, mobile menu and résumé actions               |
| `ui/project-gallery.css`                                                         | Project groups, filtering toolbar and preview framing       |
| `ui/project-preview.css`, `ui/iodine-contributions.css`                          | Screenshot states and contribution walkthrough              |
| `ui/car-controls.css`, `ui/car-picker.css`, `ui/all-controls.css`                | Stable car dock, native picker and secondary actions        |
| `ui/car-load-notice.css`, `ui/loading-bar.css`                                   | Model loading and failure feedback                          |
| `ui/work-modal.css`, `ui/work-story.css`, `ui/scroll-body.css`                   | Case-study shell, content, screenshots and reading controls |
| `ui/screenshot-viewer.css`, `ui/screenshot-image.css`, `ui/sections/credits.css` | Image inspection, image fallbacks and attribution           |
| `ui/reading-flow.css`                                                            | Scene and control visibility over reading sections          |
| `ui/dialog-motion.css`                                                           | Shared dialog entrance and native backdrop motion           |

The fixed header and project toolbar share `--portfolio-header-height`. Case
studies use the shared entrance only when no native morph is running. Images fade
in after loading; header and menu transitions remain local. Reduced motion removes
animation durations and stagger delays, including native backdrops. Pointer-follow
controls react to preference changes without requiring a reload.

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
and randomization. Add the new ID there; removing an ID retires it from
selection without breaking old links. Keep the default and the explicit prefetch pool lightweight;
full-detail models load only when selected. Check framing, paint detection, disposal,
loading failure and attribution before committing. Verify both the publisher license
and any credited upstream sources using [the model license review](model-licenses.md).
Preserve embedded attribution, original material names, paint detection, source
mesh detail, normals and texture pixels when optimizing. Compare rendered desktop
and phone views; compressed file size alone does not establish visual fidelity.
