type Point = { x: number; y: number };
type Edge = (position: number) => Point;
type Section = (position: number) => [Point, Point];

const WIDTH = 960;
const HEIGHT = 414;
const SAMPLES = 22;
const TILE_COUNT = 120;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const point = (x: number, y: number) => ({ x, y });
const line = (a: Point, b: Point, t: number) => point(mix(a.x, b.x, t), mix(a.y, b.y, t));

function cubic(a: Point, b: Point, c: Point, d: Point, t: number) {
  const f = 1 - t;
  return point(
    f ** 3 * a.x + 3 * f ** 2 * t * b.x + 3 * f * t ** 2 * c.x + t ** 3 * d.x,
    f ** 3 * a.y + 3 * f ** 2 * t * b.y + 3 * f * t ** 2 * c.y + t ** 3 * d.y,
  );
}

// Sample both edges at the same distance along the middle of the letter.
function spine(segments: [Edge, Edge][]): Section {
  const points: { left: Point; right: Point; distance: number }[] = [];
  let distance = 0;
  let previous: Point | undefined;
  for (const [a, b] of segments) {
    for (let sample = 0; sample <= 64; sample++) {
      const t = sample / 64;
      const left = a(t);
      const right = b(t);
      const middle = line(left, right, 0.5);
      if (previous) distance += Math.hypot(middle.x - previous.x, middle.y - previous.y);
      points.push({ left, right, distance });
      previous = middle;
    }
  }
  return (position) => {
    const d = clamp(position) * distance;
    let lo = 0;
    let hi = points.length - 1;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (points[mid].distance < d) lo = mid + 1;
      else hi = mid;
    }
    const stop = points[lo];
    const start = points[Math.max(0, lo - 1)];
    const t = (d - start.distance) / (stop.distance - start.distance || 1);
    return [line(start.left, stop.left, t), line(start.right, stop.right, t)];
  };
}

const linear =
  (x1: number, y1: number, x2: number, y2: number): Edge =>
  (t) =>
    line(point(x1, y1), point(x2, y2), t);
const curve =
  (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
  ): Edge =>
  (t) =>
    cubic(point(x1, y1), point(x2, y2), point(x3, y3), point(x4, y4), t);
const one = spine([
  [linear(12, 88, 124, 15), linear(54, 157, 130, 107)],
  [linear(124, 15, 208, 15), linear(130, 107, 131, 107)],
  [linear(208, 15, 208, 394), linear(131, 107, 131, 394)],
]);
const two = spine([
  [curve(236, 120, 245, 45, 294, 12, 384, 12), curve(310, 134, 317, 95, 345, 78, 384, 78)],
  [curve(384, 12, 493, 12, 544, 52, 544, 128), curve(384, 78, 442, 78, 468, 96, 468, 127)],
  [curve(544, 128, 544, 182, 521, 209, 449, 255), curve(468, 127, 468, 150, 450, 172, 402, 204)],
  [linear(449, 255, 327, 331), linear(402, 204, 233, 314)],
  [linear(327, 331, 325, 331), linear(233, 314, 233, 394)],
  [linear(325, 331, 547, 331), linear(233, 394, 547, 394)],
]);
function oval(rx: number, ry: number): Edge {
  return (t) => {
    const a = -Math.PI / 2 + t * Math.PI * 2;
    const power = (n: number) => Math.sign(n) * Math.abs(n) ** 0.86;
    return point(761 + rx * power(Math.cos(a)), 204 + ry * power(Math.sin(a)));
  };
}
const zero = spine([[oval(177, 194), oval(100, 116)]]);

function polygon(sample: Section, start: number, end: number) {
  const top = [];
  const bottom = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const [a, b] = sample(mix(start, end, i / SAMPLES));
    top.push(a);
    bottom.push(b);
  }
  return [...top, ...bottom.reverse()];
}
function crossSection(letter: Section, start: number, end: number) {
  let first = letter(start);
  let last = letter(end);
  const dx = first[1].x + last[1].x - first[0].x - last[0].x;
  if (dx < 0) {
    first = [first[1], first[0]];
    last = [last[1], last[0]];
  }
  const along = point(first[1].x - first[0].x, first[1].y - first[0].y);
  const across = point(last[0].x - first[0].x, last[0].y - first[0].y);
  if (along.x * across.y - along.y * across.x < 0) [first, last] = [last, first];
  return polygon((t) => [line(first[0], first[1], t), line(last[0], last[1], t)], 0, 1);
}

function flowingStrip(index: number) {
  const v = index / (TILE_COUNT - 1);
  return polygon(
    (t) => {
      const t1 = 1 - t;
      const wave = 62 * Math.sin(2.3 * Math.PI * t - 0.3 + v * 0.8) * Math.sin(Math.PI * t);
      const x = mix(12 + 24 * (1 - Math.sin(v * Math.PI)), 932 - 6 * v, t);
      const y = 205 + (v - 0.5) * 370 * t1 ** 1.17 + wave - 22 * Math.sin(v * Math.PI) * t1;
      const halfWidth = mix(1.03, 0.28, t);
      return [point(x, y - halfWidth), point(x, y + halfWidth)];
    },
    0,
    1,
  );
}

const placeFinal = (p: Point) => point(64 + p.x * 1.4, p.y);
const finalOne: Section = (t) => {
  const [left, right] = one(t);
  return [placeFinal(left), placeFinal(right)];
};
const finalOutline = [
  point(12, 88),
  point(124, 15),
  point(208, 15),
  point(208, 394),
  point(131, 394),
  point(131, 107),
  point(130, 107),
  point(54, 157),
].map(placeFinal);
const plate: {
  tile: Point[];
  stream: Point[];
  target: Point[];
  index: number;
  digit: number;
  position: number;
}[] = [];
for (const [digit, letter] of [one, two, zero].entries()) {
  for (let i = 0; i < 40; i++) {
    const index = digit * 40 + i;
    const tile = crossSection(letter, (i + 0.115) / 40, (i + 0.885) / 40);
    const target = crossSection(
      finalOne,
      Math.max(0, (index - 0.08) / TILE_COUNT),
      Math.min(1, (index + 1.08) / TILE_COUNT),
    );
    plate.push({
      tile,
      stream: flowingStrip(index),
      target,
      index,
      digit,
      position: i / 39,
    });
  }
}
function smooth(t: number) {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
}
function path(context: CanvasRenderingContext2D, coordinates: Point[]) {
  context.beginPath();
  context.moveTo(coordinates[0].x, coordinates[0].y);
  for (let i = 1; i < coordinates.length; i++) context.lineTo(coordinates[i].x, coordinates[i].y);
  context.closePath();
}
const face = '#625080';
const edge = '#312341';
const endInk = '#342a50';

function printHeight(width: number, height: number) {
  return Math.min(height, width * (width < 650 ? 0.86 : 0.405));
}

export function firstRequestCorners(box: DOMRect) {
  const height = printHeight(box.width, box.height);
  const tile = plate[0].tile;
  return [tile[0], tile[SAMPLES], tile[SAMPLES + 1], tile[tile.length - 1]].map((p) => ({
    x: box.left + (p.x / WIDTH) * box.width,
    y: box.top + (box.height - height) / 2 + (p.y / HEIGHT) * height,
  }));
}

export function createRequestPrint(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const ink = context;
  let cssWidth = 0;
  let cssHeight = 0;
  let pixelRatio = 0;
  const coords = Array.from({ length: 2 * (SAMPLES + 1) }, () => point(0, 0));
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (width === cssWidth && height === cssHeight && ratio === pixelRatio) return;
    cssWidth = width;
    cssHeight = height;
    pixelRatio = ratio;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
  }
  function paint(progress: number, firstInTransit = false) {
    if (!cssWidth || !cssHeight) return;
    const printWidth = cssWidth;
    const height = printHeight(cssWidth, cssHeight);
    const top = (cssHeight - height) * 0.5;
    ink.resetTransform();
    ink.clearRect(0, 0, canvas.width, canvas.height);
    ink.setTransform(
      (printWidth / WIDTH) * pixelRatio,
      0,
      0,
      (height / HEIGHT) * pixelRatio,
      0,
      top * pixelRatio,
    );
    if (progress >= 0.96) {
      ink.fillStyle = endInk;
      path(ink, finalOutline);
      ink.fill();
      return;
    }
    const extrusion = 8 * (1 - smooth(progress / 0.23));
    for (const { tile, stream, target, index, digit, position } of plate) {
      if (firstInTransit && index === 0) continue;
      const v = index / (TILE_COUNT - 1);
      const release = smooth((progress - 0.025 * digit - 0.055 * position) / 0.38);
      const gather = smooth((progress - 0.47 - 0.095 * v) / 0.36);
      const thin = 1 - (1 - release) ** 4;
      const join = gather ** 2.4;
      for (let j = 0; j <= SAMPLES; j++) {
        const k = coords.length - j - 1;
        for (const axis of ['x', 'y'] as const) {
          const tileMid = (tile[j][axis] + tile[k][axis]) * 0.5;
          const streamMid = (stream[j][axis] + stream[k][axis]) * 0.5;
          const targetMid = (target[j][axis] + target[k][axis]) * 0.5;
          const middle = mix(mix(tileMid, streamMid, release), targetMid, gather);
          const half = mix(
            mix(tile[j][axis] - tileMid, stream[j][axis] - streamMid, thin),
            target[j][axis] - targetMid,
            join,
          );
          coords[j][axis] = middle + half;
          coords[k][axis] = middle - half;
        }
      }
      if (extrusion > 0.05) {
        ink.save();
        ink.translate(extrusion * 0.78, extrusion * 0.82);
        ink.fillStyle = edge;
        path(ink, coords);
        ink.fill();
        ink.restore();
      }
      path(ink, coords);
      ink.fillStyle = gather > 0.82 ? endInk : face;
      ink.fill();
    }
    if (progress > 0.88) {
      ink.globalAlpha = smooth((progress - 0.88) / 0.077);
      path(ink, finalOutline);
      ink.fillStyle = endInk;
      ink.fill();
      ink.globalAlpha = 1;
    }
  }
  return { paint, resize };
}
