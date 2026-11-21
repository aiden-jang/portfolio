import { kamchatkaExample } from '../../data/kamchatkaExample';
import { createGlobeScene, loadAurora, loadGeography } from './globe/scene';
import {
  eventLink,
  readEvents,
  vector,
  type Snapshot,
  type PickedEvent,
  type GlobePose,
  type GlobeEvent,
} from './globe/data';
import { subsolarPoint } from './globe/sun';
import { attachGlobeInput } from './globe/input';
export { loadAurora, loadGeography };
export type { PickedEvent };

const SKY_TIME = Date.parse('2026-11-17T23:00:00Z');
const ROTATION_RATE = 4;
const ROTATION_FRAME_MS = 30;
const OPENING_HOLD_MS = 235;
const featured: GlobeEvent = {
  id: 'usd0015edq',
  place: kamchatkaExample.place,
  time: Date.parse(kamchatkaExample.timestamp),
  magnitude: kamchatkaExample.sources[0].magnitude,
  scale: kamchatkaExample.sources[0].scale,
  depth: kamchatkaExample.sources[0].depthKm,
  lon: 159.7106,
  lat: 53.024,
};
const openingZoom = () => (matchMedia('(max-width: 767px)').matches ? 1.32 : 1.24);

type Options = {
  autoRotate: boolean;
  onRotation: (rotating: boolean) => void;
  paused: () => boolean;
  failed: () => void;
  exit: () => void;
  select: (event: PickedEvent | null) => void;
};
export function createOrbitGlobe(
  canvas: HTMLCanvasElement,
  snapshot: Snapshot,
  geography: ArrayBuffer,
  aurora: Uint8Array<ArrayBuffer>,
  options: Options,
) {
  const events = readEvents(snapshot);
  const selectable = [featured, ...events];
  const sun = subsolarPoint(SKY_TIME);
  const globe = createGlobeScene(
    canvas,
    geography,
    events,
    featured,
    vector(sun.lon, sun.lat),
    aurora,
  );
  const initial = {
    lon: 165,
    lat: 42,
    zoom: openingZoom(),
  };
  const pose: GlobePose = { ...initial };
  let frame = 0,
    previous = 0,
    holdUntil = 0,
    disposed = false;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let rotating = options.autoRotate && !reduced.matches;
  let lastShown: string | undefined;
  options.onRotation(rotating);
  const draw = (time: number) => {
    frame = 0;
    if (disposed || options.paused()) {
      previous = 0;
      return;
    }
    try {
      if (rotating && previous && time - previous < ROTATION_FRAME_MS) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const dt = previous ? Math.min(0.05, (time - previous) / 1000) : 1 / 60;
      previous = time;
      const moving = input.step(dt);
      if (rotating && time > holdUntil) pose.lon = (pose.lon + ROTATION_RATE * dt) % 360;
      globe.render(pose);
      if (moving || rotating) frame = requestAnimationFrame(draw);
      else previous = 0;
    } catch {
      options.failed();
    }
  };
  const wake = () => {
    if (!disposed && !frame && !options.paused()) frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    input.stop();
  };
  const visibleEvents = () => {
    const rect = canvas.closest('.preview-thumbnail')!.getBoundingClientRect();
    return selectable.flatMap((event) => {
      const at = globe.project(event.lon, event.lat);
      return at &&
        at.x > rect.left + 12 &&
        at.x < rect.right - 12 &&
        at.y > rect.top + 12 &&
        at.y < rect.bottom - 65
        ? [{ event, ...at }]
        : [];
    });
  };
  const select = (event: GlobeEvent | undefined) => {
    lastShown = event?.id;
    globe.highlight(event);
    wake();
    options.select(event ? { ...event, url: eventLink(event, pose) } : null);
  };
  const setRotating = (enabled: boolean) => {
    rotating = enabled && !reduced.matches;
    input.stop();
    options.onRotation(rotating);
    wake();
  };
  const takeControl = () => {
    if (rotating) setRotating(false);
  };
  const input = attachGlobeInput(canvas, {
    state: () => pose,
    change: wake,
    takeControl,
    exit: options.exit,
    reduced: () => reduced.matches,
    pick: (x, y, touch) => {
      let best: (typeof events)[number] | undefined,
        score = Infinity;
      for (const candidate of visibleEvents()) {
        const distance = Math.hypot(candidate.x - x, candidate.y - y);
        if (distance <= (touch ? 22 : 12) && distance < score) {
          score = distance;
          best = candidate.event;
        }
      }
      select(best);
    },
  });
  const reset = () => {
    takeControl();
    input.stop();
    Object.assign(pose, initial);
    select(undefined);
    wake();
  };
  canvas.addEventListener('globe-reset', reset);
  const resize = new ResizeObserver(() => {
    const zoom = openingZoom();
    pose.zoom *= zoom / initial.zoom;
    initial.zoom = zoom;
    globe.resize();
    wake();
  });
  resize.observe(canvas.parentElement!);
  const lost = (e: Event) => {
    e.preventDefault();
    stop();
    options.failed();
  };
  canvas.addEventListener('webglcontextlost', lost);
  globe.render(pose);
  holdUntil = performance.now() + OPENING_HOLD_MS;
  wake();
  return {
    reset,
    setRotating,
    clearSelection: () => select(undefined),
    showFeatured: () => {
      takeControl();
      input.stop();
      Object.assign(pose, initial);
      select(featured);
      wake();
    },
    showEvent: () => {
      takeControl();
      const visible = visibleEvents();
      const last = visible.findIndex(({ event }) => event.id === lastShown);
      select(visible.length ? visible[(last + 1) % visible.length]?.event : undefined);
    },
    sync: () => {
      if (options.paused()) stop();
      else wake();
    },
    dispose: () => {
      disposed = true;
      stop();
      resize.disconnect();
      input.dispose();
      canvas.removeEventListener('globe-reset', reset);
      canvas.removeEventListener('webglcontextlost', lost);
      globe.dispose();
    },
  };
}
