import type { GlobePose } from './data';

type Options = {
  state: () => GlobePose;
  change: () => void;
  pick: (x: number, y: number, touch: boolean) => void;
  exit: () => void;
  reduced: () => boolean;
};
export function attachGlobeInput(canvas: HTMLCanvasElement, options: Options) {
  const pointers = new Map<number, { x: number; y: number }>();
  let press: { x: number; y: number; moved: boolean } | null = null,
    last = 0,
    pinch = 0,
    vx = 0,
    vy = 0;
  const spread = () => {
    const [a, b] = [...pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    vx = vy = 0;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last = performance.now();
    if (pointers.size === 1) press = { x: e.clientX, y: e.clientY, moved: false };
    if (pointers.size === 2) {
      pinch = spread();
      if (press) press.moved = true;
    }
  };
  const move = (e: PointerEvent) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pose = options.state();
    if (pointers.size === 2) {
      const distance = spread();
      if (pinch > 0) pose.zoom = Math.max(0.7, Math.min(3, (pose.zoom * distance) / pinch));
      pinch = distance;
      vx = vy = 0;
      options.change();
      return;
    }
    if (!press) return;
    if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 6) return;
    press.moved = true;
    const factor = 135 / Math.min(canvas.clientWidth, canvas.clientHeight) / pose.zoom;
    const dx = (prev.x - e.clientX) * factor,
      dy = (e.clientY - prev.y) * factor;
    pose.lon += dx;
    pose.lat = Math.max(-80, Math.min(80, pose.lat + dy));
    const now = performance.now(),
      elapsed = Math.max(0.008, (now - last) / 1000);
    vx = dx / elapsed;
    vy = dy / elapsed;
    last = now;
    options.change();
  };
  const up = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    pinch = 0;
    if (e.type === 'pointerup' && press && !press.moved)
      options.pick(e.clientX, e.clientY, e.pointerType === 'touch');
    if (e.type === 'pointercancel' || performance.now() - last > 90 || options.reduced())
      vx = vy = 0;
    if (!pointers.size) press = null;
    options.change();
  };
  const key = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const delta = e.shiftKey ? 24 : 8,
      pose = options.state();
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-delta, 0],
      ArrowRight: [delta, 0],
      ArrowUp: [0, delta],
      ArrowDown: [0, -delta],
    };
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      options.exit();
      return;
    }
    if (!(e.key in steps) && e.key !== '0') return;
    e.preventDefault();
    e.stopPropagation();
    vx = vy = 0;
    if (e.key === '0') canvas.dispatchEvent(new Event('globe-reset'));
    else {
      const [lon, lat] = steps[e.key];
      pose.lon += lon;
      pose.lat = Math.max(-80, Math.min(80, pose.lat + lat));
      options.change();
    }
  };
  const stop = () => {
    vx = vy = 0;
  };
  const changeMotion = () => {
    stop();
    options.change();
  };
  const media = matchMedia('(prefers-reduced-motion:reduce)');
  media.addEventListener('change', changeMotion);
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', key);
  return {
    stop,
    step: (dt: number) => {
      if (pointers.size || options.reduced() || Math.abs(vx) + Math.abs(vy) < 0.1) return false;
      const pose = options.state();
      pose.lon += vx * dt;
      pose.lat = Math.max(-80, Math.min(80, pose.lat + vy * dt));
      const decay = Math.exp(-8 * dt);
      vx *= decay;
      vy *= decay;
      return true;
    },
    dispose: () => {
      media.removeEventListener('change', changeMotion);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('keydown', key);
      pointers.clear();
    },
  };
}
