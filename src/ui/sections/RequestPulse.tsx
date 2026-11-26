import { useLayoutEffect, useRef } from 'react';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function requestTracks() {
  const tracks = new Path2D();
  for (let row = 0; row < 10; row++) {
    const y = 26 + 23 * row;
    tracks.moveTo(25, y);
    tracks.lineTo(330, y);
    tracks.bezierCurveTo(372, y, 380, 130, 428, 130);
  }
  tracks.moveTo(428, 130);
  tracks.lineTo(588, 130);
  return tracks;
}

function render(canvas: HTMLCanvasElement, t: number, tracks: Path2D) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scale = Math.min(canvas.width / 640, canvas.height / 268);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(
    scale,
    0,
    0,
    scale,
    (canvas.width - 640 * scale) / 2,
    (canvas.height - 268 * scale) / 2,
  );
  ctx.strokeStyle = '#739e8738';
  ctx.lineWidth = 1;
  ctx.stroke(tracks);
  for (let i = 0; i < 120; i++) {
    const row = Math.floor(i / 12),
      col = i % 12;
    const p = clamp((t - 0.12 - row * 0.016 - col * 0.003) / 0.42);
    const startX = 25 + col * 24,
      startY = 26 + row * 23;
    // One continuous route with a horizontal tangent where the lanes join.
    const x = mix(startX, 428, p);
    const u = clamp((x - 330) / 98);
    const y = mix(startY, 130, u * u * (3 - 2 * u));
    const wave = clamp(1 - Math.abs(t - (col * 0.009 + row * 0.009 + 0.038)) / 0.052);
    ctx.globalAlpha = 1 - clamp((p - 0.95) / 0.05);
    ctx.strokeStyle = wave > 0.43 ? '#fff2cf' : u > 0.2 ? '#abd9c1' : '#ddbd8f';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 11, y);
    ctx.stroke();
  }
  ctx.globalAlpha = clamp((t - 0.69) / 0.045);
  const x = mix(428, 588, clamp((t - 0.7) / 0.24));
  for (const [r, color] of [
    [10, '#a9eccb33'],
    [4.5, '#d9ffeb'],
  ] as const) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, 130, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = t >= 0.95 ? 1 : 0;
  if (ctx.globalAlpha) {
    ctx.strokeStyle = '#bcebd480';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(588, 130, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#ceead8';
  ctx.font = '570 49px system-ui';
  ctx.textAlign = 'end';
  ctx.fillText('2s', 600, 106);
  ctx.globalAlpha = 1;
}

export function RequestPulse({ onPaint }: { onPaint: (position: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current!;
    const tracks = requestTracks();
    const owner = canvas.closest('figure')!;
    let current = Number(owner.dataset.pulse || 0),
      target = current,
      frame = 0,
      last = 0;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.max(1, Math.round(box.width * dpr));
      canvas.height = Math.max(1, Math.round(box.height * dpr));
      render(canvas, current, tracks);
    };
    const tick = (now: number) => {
      const dt = Math.min(64, Math.max(1, now - last));
      last = now;
      current += (target - current) * (1 - Math.exp(-dt / 44));
      if (Math.abs(target - current) < 0.0015) current = target;
      render(canvas, current, tracks);
      onPaint(current);
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };
    const update = (event: Event) => {
      const { value, instant } = (event as CustomEvent<{ value: number; instant: boolean }>).detail;
      target = value;
      if (instant || Math.abs(target - current) > 0.6) {
        cancelAnimationFrame(frame);
        frame = 0;
        current = target;
        render(canvas, current, tracks);
        onPaint(current);
      } else if (!frame && target !== current) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    owner.addEventListener('pulse-position', update);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      owner.removeEventListener('pulse-position', update);
    };
  }, [onPaint]);
  return <canvas ref={ref} className="request-pulse" aria-hidden="true" />;
}
