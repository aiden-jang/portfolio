# aidenjang.com

Personal portfolio. A scrollable Three.js scene with seven 3D car models, plus the standard About / Work / Resume / Contact.

## Stack

- React 18 + TypeScript
- [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) + [drei](https://github.com/pmndrs/drei) + [postprocessing](https://github.com/pmndrs/postprocessing)
- Tailwind CSS v4
- Zustand for shared state
- Vite

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

## Build

```bash
npm run build
```

Outputs to `dist/`. `npm run preview` serves it.

## Project layout

```
src/
  main.tsx            React root
  App.tsx             Composition root
  store.ts            Zustand store
  config.ts           Themes, cars, keyframes, section IDs
  types.ts, math.ts   Shared types and math helpers
  index.css           Tailwind + animation rules
  three/              R3F scene (Scene, Lights, Floor, Car, CameraRig, Effects)
  hooks/              useNavigation (wheel/keyboard nav), useReveal (intersection observer)
  ui/                 DOM components (Nav, Sections, CarSwitcher, ColorSwatches, …)
public/
  models/             Compressed GLBs (EXT_meshopt_compression + WebP textures)
```

## Model credits

All car models are CC BY 4.0. See the Contact section of the live site for full author + Sketchfab links.
