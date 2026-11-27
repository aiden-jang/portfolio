// A playable cat round for the match to Bean. Coordinates share her sitting pose.
const outlines = [
  [
    [2, 4],
    [1.7, 2],
    [2, 0.9],
    [3, 1],
    [5.5, 4],
    [8, 4.1],
    [11, 4],
    [14.8, 1],
  ],
  [
    [1.8, 4],
    [1.2, 7],
    [1.8, 9.5],
    [3.5, 11],
    [3.3, 14],
    [2.8, 16],
    [1.5, 17.2],
    [2.4, 18],
    [6, 18.2],
    [9, 18.4],
    [14.6, 18.1],
    [16.1, 17],
    [15.5, 16],
    [15.2, 12],
    [14.5, 10.5],
    [16.3, 9],
    [16.7, 6],
    [16, 4],
  ],
  [
    [4, 7.4],
    [4.8, 6.8],
    [5.7, 7.2],
  ],
  [
    [11.6, 7.2],
    [12.6, 6.8],
    [13.3, 7.3],
  ],
  [
    [2.8, 8.6],
    [0.7, 8.1],
    [-1.6, 7.8],
  ],
  [
    [2.7, 9.4],
    [0.6, 9.6],
    [-1.4, 10.1],
  ],
  [
    [15.1, 8.6],
    [17.2, 8.0],
    [19.2, 7.6],
  ],
  [
    [15.0, 9.4],
    [17.3, 9.6],
    [19.0, 10.0],
  ],
  [
    [5.8, 13.8],
    [5.6, 16.5],
    [4.6, 17.4],
  ],
  [
    [11.9, 13.7],
    [12.1, 16.6],
    [13.1, 17.5],
  ],
  [
    [14.7, 1.1],
    [15.6, 0.7],
    [16.1, 1.5],
    [16, 4.2],
  ],
];
const paths = outlines.map((stroke) =>
  stroke.flatMap(([x, y], i) => {
    if (!i) return [[x, y]];
    const [a, b] = stroke[i - 1];
    const steps = Math.ceil(Math.hypot(x - a, y - b) * 4);
    return Array.from({ length: steps }, (_, j) => [
      a + ((x - a) * (j + 1)) / steps,
      b + ((y - b) * (j + 1)) / steps,
    ]);
  }),
);
export const pointCount = paths.reduce((n, p) => n + p.length, 0);
export function paintCat(canvas: HTMLCanvasElement, visible: number, ink = '#f7f0df') {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 960, 605);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  for (const path of paths) {
    if (visible <= 0) break;
    ctx.beginPath();
    path.slice(0, visible).forEach(([x, y], i) => {
      const sx = 300 + x * 20,
        sy = 112 + y * 20;
      if (i) ctx.lineTo(sx, sy);
      else ctx.moveTo(sx, sy);
    });
    ctx.stroke();
    visible -= path.length;
  }
}

export const firstStrokeLength = paths[0].length;
