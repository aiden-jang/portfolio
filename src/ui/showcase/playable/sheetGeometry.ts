import { H, W, type Stroke, type XY } from './portrait';

export type Projection = { scale: number; x: number; y: number };
export type SheetGeometry = { screen: Projection; print: Projection };
export const identity: Projection = { scale: 1, x: 0, y: 0 };

function bounds(strokes: Stroke[]) {
  let left = Infinity,
    right = -Infinity,
    top = Infinity,
    bottom = -Infinity;
  for (const stroke of strokes) {
    for (const [x, y] of stroke.points) {
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  return { left, right, top, bottom };
}

export function screenProjection(width: number, height: number, strokes: Stroke[]): Projection {
  let scale = Math.min(width / (width < 740 ? 790 : 900), height / 820);
  const center = { x: width / 2, y: height * 0.475 };
  if (strokes.length) {
    // Rotation or a shorter window must keep marks made at the old edges in reach.
    const b = bounds(strokes);
    const halfWidth = Math.max(W / 2 - b.left, b.right - W / 2, 1) + 5;
    const top = Math.max(H / 2 - b.top, 1) + 5;
    const bottom = Math.max(b.bottom - H / 2, 1) + 5;
    scale = Math.min(scale, center.x / halfWidth, center.y / top, (height - center.y) / bottom);
  }
  return {
    scale,
    x: center.x - (W / 2) * scale,
    y: center.y - (H / 2) * scale,
  };
}

export function printProjection(strokes: Stroke[]): Projection {
  if (!strokes.length) return identity;
  const b = bounds(strokes);
  const scale = Math.min(
    1.55,
    (W - 110) / (b.right - b.left + 12),
    (H - 72) / (b.bottom - b.top + 12),
  );
  return {
    scale,
    x: W / 2 - ((b.left + b.right) / 2) * scale,
    y: H / 2 - ((b.top + b.bottom) / 2) * scale,
  };
}

export function inkPoint(face: HTMLCanvasElement, p: Projection, x: number, y: number): XY {
  const r = face.getBoundingClientRect();
  return [(x - r.left - p.x) / p.scale, (y - r.top - p.y) / p.scale];
}

export function printedAreaOnScreen(face: HTMLCanvasElement, sheet: SheetGeometry) {
  const rect = face.getBoundingClientRect();
  const ratio = sheet.screen.scale / sheet.print.scale;
  const x = rect.left + sheet.screen.x - sheet.print.x * ratio;
  const y = rect.top + sheet.screen.y - sheet.print.y * ratio;
  return {
    x: x + (W * ratio) / 2,
    y: y + (H * ratio) / 2,
    width: W * ratio,
    height: H * ratio,
  };
}
