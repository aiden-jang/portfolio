import { alignGlobeReading, visibleGlobeEvents } from './globe/projection';
import { lerp, lerpAngle } from '../../math';
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
import type { RecordedWeather } from './globe/recordedWeatherAssets';
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
const openingZoom = (compact?: boolean) => {
  const phone = matchMedia('(max-width: 767px)').matches;
  if (compact) return phone ? 1.04 : 0.99;
  return phone ? 0.91 : 0.94;
};

type Options = {
  compact?: boolean;
  autoRotate: boolean;
  onRotation: (rotating: boolean) => void;
  onManual?: () => void;
  paused: () => boolean;
  failed: () => void;
  exit: () => void;
  select: (event: PickedEvent | null) => void;
  weather?: RecordedWeather;
};
export function createOrbitGlobe(
  canvas: HTMLCanvasElement,
  snapshot: Snapshot,
  geography: ArrayBuffer,
  aurora: Uint8Array<ArrayBuffer>,
  options: Options,
) {
  const events = readEvents(snapshot).filter(
    (event) => !options.weather || event.id !== featured.id,
  );
  const selectable = [featured, ...events];
  const sun = subsolarPoint(SKY_TIME);
  const globe = createGlobeScene(
    canvas,
    geography,
    events,
    featured,
    vector(sun.lon, sun.lat),
    aurora,
    options.weather,
  );
  const initial = {
    lon: 149,
    lat: 36,
    zoom: openingZoom(options.compact),
  };
  const pose: GlobePose = { ...initial };
  const art = canvas.closest<HTMLElement>('.preview-thumbnail');
  let frame = 0,
    previous = 0,
    holdUntil = 0,
    disposed = false;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let rotating = options.autoRotate && !reduced.matches;
  let lastShown: string | undefined;
  let journey = 0;
  let origin: GlobePose | undefined;
  let retained = false;
  let inspecting = false;
  let lastPulse = 0;
  let lastSweep = 0;
  options.onRotation(rotating);
  const draw = (time: number) => {
    frame = 0;
    if (disposed || options.paused()) {
      previous = 0;
      return;
    }
    try {
      const idle = Boolean(options.weather) && !reduced.matches && !retained;
      if (previous && time - previous < (rotating ? ROTATION_FRAME_MS : 42) && (rotating || idle)) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const dt = previous ? Math.min(0.05, (time - previous) / 1000) : 1 / 60;
      previous = time;
      const moving = journey === 0 && input.step(dt);
      if (journey === 0 && rotating && time > holdUntil)
        pose.lon = (pose.lon + ROTATION_RATE * dt) % 360;
      if (!retained) {
        lastPulse = reduced.matches || (lastShown && lastShown !== featured.id) ? 0 : time / 1000;
        lastSweep = reduced.matches ? 0 : time / 1000;
      }
      globe.render(pose, journey, lastPulse, lastSweep);
      alignGlobeReading(canvas, art, globe, journey > 0 ? featured : undefined);
      if (moving || (rotating && journey === 0) || idle) frame = requestAnimationFrame(draw);
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
  const undirect = () => {
    retained = false;
    journey = 0;
    origin = undefined;
    options.onManual?.();
  };
  const takeControl = () => {
    undirect();
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
      for (const candidate of visibleGlobeEvents(canvas, selectable, globe)) {
        const distance = Math.hypot(candidate.x - x, candidate.y - y);
        if (distance <= (touch ? 22 : 12) && distance < score) {
          score = distance;
          best = candidate.event;
        }
      }
      if (best && touch) takeControl();
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
  const steer = (event: Event) => {
    const t = (event as CustomEvent<number>).detail;
    if (inspecting || retained || t === journey) return;
    journey = t;
    if (journey > 0) {
      if (!origin) origin = { ...pose };
      input.stop();
      globe.highlight(featured);
      const close = 1.07;
      pose.lon =
        (lerpAngle((origin.lon * Math.PI) / 180, (featured.lon * Math.PI) / 180, t) * 180) /
        Math.PI;
      pose.lat = lerp(origin.lat, featured.lat, t);
      pose.zoom = lerp(origin.zoom, close, t);
    } else if (origin) {
      Object.assign(pose, origin);
      origin = undefined;
    }
    wake();
  };
  canvas.addEventListener('quake-journey', steer);
  canvas.addEventListener('globe-reset', reset);
  const resize = new ResizeObserver(() => {
    const zoom = openingZoom(options.compact);
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
    inspectFeatured: () => {
      const saved = { pose: { ...pose }, journey, rotating, origin, retained };
      inspecting = true;
      input.stop();
      setRotating(false);
      retained = false;
      journey = 1;
      Object.assign(pose, {
        lon: featured.lon,
        lat: featured.lat,
        zoom: 1.07,
      });
      globe.highlight(featured);
      wake();
      return () => {
        inspecting = false;
        Object.assign(pose, saved.pose);
        journey = saved.journey;
        origin = saved.origin;
        retained = saved.retained;
        globe.highlight(selectable.find((event) => event.id === lastShown));
        setRotating(saved.rotating);
        wake();
      };
    },
    capture: () => {
      if (!art || disposed || !canvas.width) return;
      setRotating(false);
      retained = true;
      globe.render(pose, journey, lastPulse, lastSweep);
      return {
        image: canvas.toDataURL('image/png'),
        place: selectable.find((event) => event.id === lastShown)?.place ?? featured.place,
        source: art,
      };
    },
    reset,
    setRotating,
    toggleRotation: () => {
      undirect();
      setRotating(!rotating);
    },
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
      const visible = visibleGlobeEvents(canvas, selectable, globe);
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
      canvas.removeEventListener('quake-journey', steer);
      canvas.removeEventListener('webglcontextlost', lost);
      globe.dispose();
    },
  };
}
