import { paintCat } from '../catDrawing';

export const inks = [
  { name: 'Poppy', color: '#ffa48b' },
  { name: 'Cobalt', color: '#aebfff' },
  { name: 'Spruce', color: '#97e2c3' },
];
export const W = 1000,
  H = 600;
export const stockInk = '#f3ead8';
export const paperColor = '#221f24';
export type XY = [number, number];
export type Stroke = { ink: number; points: XY[] };
export const drawingStorageKey = 'aiden-portfolio-portrait-v1';

export function restore(): Stroke[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(drawingStorageKey) || '[]');
    if (!Array.isArray(value)) return [];
    return value
      .slice(-96)
      .filter(
        (s) =>
          s &&
          Number.isInteger(s.ink) &&
          inks[s.ink] &&
          Array.isArray(s.points) &&
          s.points.length &&
          s.points.length <= 4800 &&
          s.points.every((p: XY) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)),
      );
  } catch {
    return [];
  }
}

export function createPaper() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  return canvas;
}

export function makeInkSurface() {
  const source = document.createElement('canvas');
  source.width = 960;
  source.height = 605;
  return source;
}

export function paintBase(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  visible: number,
) {
  paintCat(source, visible, stockInk);
  // Keep the actual cat round intact and give the ink enough weight for a small print.
  for (const [dx, dy] of [
    [0, 0],
    [-1.1, 0],
    [1.1, 0.4],
    [0.4, 1.15],
    [0, -1.15],
  ]) {
    ctx.drawImage(source, 259, 113, 441, 388, 203 + dx, 38 + dy, 595, 524);
  }
}

export function inkStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  const first = s.points[0];
  if (!first) return;
  ctx.fillStyle = ctx.strokeStyle = inks[s.ink].color;
  ctx.lineWidth = 9;
  ctx.lineJoin = ctx.lineCap = 'round';
  if (s.points.length === 1) {
    ctx.beginPath();
    ctx.arc(first[0], first[1], 4.5, 0, 2 * Math.PI);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(...first);
  for (let i = 1; i < s.points.length; i++) ctx.lineTo(...s.points[i]);
  ctx.stroke();
}
export function keyboardTip(key: string, tip: XY, largeStep: boolean): XY | null {
  const steps: Record<string, XY> = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  const step = steps[key];
  if (!step) return null;
  return [
    Math.max(4, Math.min(W - 4, tip[0] + step[0] * (largeStep ? 34 : 13))),
    Math.max(4, Math.min(H - 4, tip[1] + step[1] * (largeStep ? 34 : 13))),
  ];
}

export function savePortrait(strokes: Stroke[]) {
  try {
    sessionStorage.setItem(drawingStorageKey, JSON.stringify(strokes));
  } catch {
    // The drawing stays in memory when session storage is unavailable.
  }
}
