import model from './guess-weights.json';
import type { Stroke } from './portrait';

const weights = model.layers.map(({ data, scale }) => {
  const bytes = Uint8Array.from(atob(data), (ch) => ch.charCodeAt(0));
  return Float32Array.from(new Int8Array(bytes.buffer), (n) => n * scale);
});
const size = model.input;
function readInk(strokes: Stroke[]) {
  let left = Infinity,
    right = -Infinity,
    top = Infinity,
    bottom = -Infinity,
    length = 0;
  for (const { points } of strokes) {
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      if (i) length += Math.hypot(x - points[i - 1][0], y - points[i - 1][1]);
    }
  }
  const span = Math.max(right - left, bottom - top);
  if (!(length > 38 && span > 22 && Math.min(right - left, bottom - top) > span * 0.12)) return;
  const scale = 76 / span,
    ox = 48 - ((left + right) * scale) / 2,
    oy = 48 - ((bottom + top) * scale) / 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 96;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.lineWidth = 6;
  ctx.lineCap = ctx.lineJoin = 'round';
  for (const { points } of strokes) {
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i) ctx.lineTo(x * scale + ox, y * scale + oy);
      else ctx.moveTo(x * scale + ox, y * scale + oy);
    });
    if (points.length === 1) {
      ctx.arc(points[0][0] * scale + ox, points[0][1] * scale + oy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else ctx.stroke();
  }
  const pixels = ctx.getImageData(0, 0, 96, 96).data,
    input = new Float32Array(size * size);
  for (let y = 0; y < 96; y++)
    for (let x = 0; x < 96; x++)
      input[(y >> 2) * size + (x >> 2)] += pixels[(y * 96 + x) * 4 + 3] / (255 * 16);
  return input;
}
export function guessDrawing(strokes: Stroke[]): string {
  if (!strokes.length) return '';
  const input = readInk(strokes);
  if (!input) return 'One more stroke…';
  const [inWeights, outWeights] = weights,
    hidden = Float32Array.from(model.bias[0]),
    scores = Float32Array.from(model.bias[1]);
  for (let i = 0; i < input.length; i++)
    if (input[i])
      for (let j = 0; j < hidden.length; j++)
        hidden[j] += input[i] * inWeights[i * hidden.length + j];
  for (let j = 0; j < hidden.length; j++)
    if (hidden[j] > 0)
      for (let c = 0; c < scores.length; c++)
        scores[c] += hidden[j] * outWeights[j * scores.length + c];
  const best = Math.max(...scores),
    index = scores.indexOf(best);
  const probability = 1 / scores.reduce((sum, value) => sum + Math.exp(value - best), 0);
  if (probability < 0.42) return 'One more stroke…';
  return 'A ' + model.names[index] + '?';
}
