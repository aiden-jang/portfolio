# aidenjang.com

Personal portfolio built around an interactive 3D car scene. Seven models you can
orbit, repaint, and cycle through, with the camera touring each car as you scroll.
About / Work / Experience / Contact sit as overlay panels on top of the canvas.

Live at [aidenjang.com](https://aidenjang.com).

## Stack

- React 18 + TypeScript, bundled with Vite 6
- React Three Fiber + drei + postprocessing on top of Three.js
- Tailwind CSS v4
- Zustand for shared state
- Deployed on Vercel (Analytics + Speed Insights)

## Running it

Requires Node 20+.

```bash
npm install
npm run dev        # dev server, usually http://localhost:5173
```

```bash
npm run build      # tsc --noEmit, then vite build, output in dist/
npm run preview    # serve the production build
npm run typecheck  # types only
```

`build` typechecks before bundling, so a type error fails the build.

## How it works

The whole scene is driven by one number: scroll progress, computed as
`scrollY / maxScroll` clamped to `0..1` (`getScrollT`). The camera, the section
state, and the content reveals all read off it.

### One scroll value drives the camera

The camera never holds a fixed pose. `CameraRig` stores one keyframe per section
(azimuth, elevation, distance, look-at target) and interpolates between them by
scroll progress, so moving down the page orbits the car. A single `useFrame`
composes every source of camera motion in a fixed order: scroll keyframe
interpolation, pointer-drag orbit with inertial decay, idle auto-spin when nothing
else is happening, the intro pull-in, a floor clamp so the camera never dips below
the ground, a brief FOV punch on section change, and a rev shake on tap. Keeping it
in one place means these never fight each other over the transform.

### State is split by update frequency

The Zustand store holds two kinds of state. Things that change on a user action
(selected car, theme, section index) are React state and trigger re-renders.
Things that change every frame (rev intensity, the active paint material, lamp
references, eased exposure) live on a plain `refs` object and are mutated
imperatively, so 60fps updates never cascade into React renders.

### Scrolling and navigation

Vertical scroll is left fully native. CSS scroll-snap was dropped because it
re-snapped after every discrete mouse-wheel tick and fought the wheel. Instead,
once scrolling stops a debounced settle eases the page to the nearest section with
a custom requestAnimationFrame tween, and any input (wheel, key, touch) cancels the
glide so it never fights you mid-gesture. Keyboard (arrows, PageUp/Down, Home, End),
nav links, and the side dots jump via a locked smooth scroll. Horizontal wheel and
horizontal touch flicks cycle cars; `c` repaints, `b` toggles the theme.

### Models and loading

Car GLBs are compressed with EXT_meshopt_compression and WebP textures, and the
meshopt decoder is wired into the loader once. On each swap the previous model and
its lamps are disposed to keep GPU memory flat, the new model is auto-fit to a
target length, and its paint material is detected so the color swatches can drive
it. After a load finishes, the two adjacent cars are prefetched (low-priority
`fetch`, cache only) so left/right cycling feels instant.

### Accessibility and motion

`prefers-reduced-motion` is honored in two layers: a CSS media query collapses
every transition and animation, and `prefersReducedMotion()` gates the JS-driven
motion so camera tweens, idle spin, rev shake, and the settle glide fall back to
instant jumps. There is a skip-to-content link, focus-visible rings, and the
decorative canvas is hidden from the accessibility tree.

## Project layout

```
src/
  main.tsx              React root
  App.tsx               Composition root (canvas + DOM chrome)
  store.ts              Zustand store (React state + imperative refs)
  config.ts             Themes, car specs + credits, camera keyframes, section IDs
  math.ts, types.ts     Lerp/clamp/angle helpers, shared types
  index.css             Tailwind theme + animation and reduced-motion rules
  three/
    Scene.tsx           Canvas and scene composition
    CameraRig.tsx       Per-frame camera (scroll keyframes, drag, intro, rev)
    Car.tsx             GLB load/swap, lamps, underglow, prefetch
    Floor, Lights, Effects, carHelpers
  hooks/
    useNavigation.ts    Scroll settle, keyboard nav, car cycling
    useReveal.ts        IntersectionObserver panel reveals
    useMagnetic, useReducedMotion, useLocalTime
  ui/                   Nav, Sections, SectionDots, CarSwitcher, ColorSwatches,
                        ThemeToggle, ResumeButton, WorkModal, Brand, LoadingBar
public/
  models/               Compressed GLBs (meshopt + WebP)
  og-image.png          Social preview (capture via the ?clean canvas mode)
```

## Adding a car

Drop a meshopt-compressed GLB into `public/models/`, then add an entry to `CARS`
in `src/config.ts`: file name, display name, a per-car exposure multiplier, and the
CC BY credit. The loader, prefetch, switcher UI, and credits all read from that
array.

## Credits

All car models are CC BY 4.0. Authors and Sketchfab links live in `src/config.ts`
and on the live site's Contact section.
