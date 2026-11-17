import { createGlobeScene, loadGeography } from './globe/scene';
import {
  eventLink,
  markerRadius,
  readEvents,
  vector,
  type Snapshot,
  type PickedEvent,
  type GlobePose,
} from './globe/data';
import { subsolarPoint } from './globe/sun';
import { attachGlobeInput } from './globe/input';
export { loadGeography };
export type { PickedEvent };

type Options = {
  paused: () => boolean;
  failed: () => void;
  exit: () => void;
  select: (event: PickedEvent | null) => void;
};
export function createOrbitGlobe(
  canvas: HTMLCanvasElement,
  snapshot: Snapshot,
  geography: ArrayBuffer,
  options: Options,
) {
  const events = readEvents(snapshot);
  const sun = subsolarPoint(snapshot.metadata.generated);
  const globe = createGlobeScene(canvas, geography, events, vector(sun.lon, sun.lat));
  const initial = {
    lon: 145,
    lat: 24,
    zoom: matchMedia('(max-width:767px), (pointer:coarse)').matches ? 1.1 : 1.2,
  };
  const pose: GlobePose = { ...initial };
  let frame = 0,
    previous = 0,
    disposed = false;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const draw = (time: number) => {
    frame = 0;
    if (disposed || options.paused()) {
      previous = 0;
      return;
    }
    try {
      const dt = previous ? Math.min(0.05, (time - previous) / 1000) : 1 / 60;
      previous = time;
      const moving = input.step(dt);
      globe.render(pose);
      if (moving) frame = requestAnimationFrame(draw);
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
    return events.flatMap((event) => {
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
  const select = (event: (typeof events)[number] | undefined) =>
    options.select(event ? { ...event, url: eventLink(event, pose) } : null);
  const input = attachGlobeInput(canvas, {
    state: () => pose,
    change: wake,
    exit: options.exit,
    reduced: () => reduced.matches,
    pick: (x, y, touch) => {
      let best: (typeof events)[number] | undefined,
        score = Infinity;
      for (const candidate of visibleEvents()) {
        const radius = markerRadius(candidate.event.magnitude, globe.scale()),
          distance = Math.hypot(candidate.x - x, candidate.y - y);
        const rank = distance - radius;
        if (distance <= radius + (touch ? 15 : 5) && rank < score) {
          score = rank;
          best = candidate.event;
        }
      }
      select(best);
    },
  });
  const reset = () => {
    input.stop();
    Object.assign(pose, initial);
    options.select(null);
    wake();
  };
  canvas.addEventListener('globe-reset', reset);
  const resize = new ResizeObserver(() => {
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
  return {
    reset,
    showEvent: () =>
      select(visibleEvents().sort((a, b) => b.event.magnitude - a.event.magnitude)[0]?.event),
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
