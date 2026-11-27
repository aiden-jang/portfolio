import { useEffect, useRef } from 'react';
import { clamp, lerp } from '../../math';

const leafShapes = [
  { height: 199, y: 136.45, radius: 7.875, color: '#8abda3' },
  { height: 265, y: 191.92, radius: 8.1, color: '#648442' },
  { height: 173, y: 119.9, radius: 7.875, color: '#89b398' },
];
function smooth(n: number) {
  const x = clamp(n, 0, 1);
  return x * x * (3 - 2 * x);
}
export function GardenLeafCut() {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const layer = svg.current!;
    const outline = layer.querySelector('path')!;
    const garden = document.querySelector<HTMLElement>('#project-bloomnote');
    const board = document.querySelector<HTMLCanvasElement>('.iguess-draw-board');
    if (!board || !garden) return;
    const canvas = board;
    const media = matchMedia('(prefers-reduced-motion:no-preference)');
    let frame = 0,
      previous = -2;
    function ink(amount: number) {
      if (amount === previous) return;
      previous = amount;
      canvas.dispatchEvent(new CustomEvent('leaf-ink', { detail: amount }));
    }
    function hide() {
      layer.style.display = 'none';
      ink(-1);
    }
    function draw() {
      frame = 0;
      const plant = garden!.querySelector<HTMLImageElement>(
        '.bloom-garden-inner [aria-pressed=true] img',
      );
      if (
        !media.matches ||
        !plant ||
        garden!.dataset.composing ||
        canvas.closest('[hidden]') ||
        document.hidden
      ) {
        hide();
        return;
      }
      const box = canvas.getBoundingClientRect(),
        k = Math.min(box.width / 960, box.height / 605);
      const bx = box.x + (box.width - 960 * k) / 2,
        by = box.y + (box.height - 605 * k) / 2;
      const ear = { x: bx + 340 * k, y: by + 192 * k };
      const p = smooth((innerHeight * 1.46 - ear.y) / (innerHeight * 0.94));
      if (!k || p <= 0 || p >= 1 || canvas.matches(':active')) {
        hide();
        return;
      }
      const plantBox = plant.getBoundingClientRect();
      const index = Array.from(
        garden!.querySelectorAll('.bloom-garden-inner .bloom-garden-flower'),
      ).indexOf(plant.closest('button')!);
      const leaf = leafShapes[index] ?? leafShapes[0];
      const scale = Math.min(plantBox.width / 96, plantBox.height / leaf.height);
      const sx = plantBox.left + (plantBox.width - 96 * scale) / 2 + 38 * scale;
      const sy = plantBox.bottom - (leaf.height - 18 - leaf.y) * scale;
      const flight = smooth(p / 0.75),
        fold = smooth((p - 0.24) / 0.51);
      const arc = Math.sin(flight * Math.PI);
      const x = lerp(sx, ear.x, flight) + arc * Math.min(80, innerWidth * 0.08);
      const y = lerp(sy, ear.y, flight) - arc * Math.min(110, innerHeight * 0.15);
      const radius = leaf.radius * scale;
      // Each successive point on the leaf settles onto Bean's first drawn ear.
      const start = [
        [-1, 0],
        [-0.6, -0.52],
        [0, -0.6],
        [0.64, -0.42],
        [1, 0],
        [0.55, 0.5],
        [0, 0.6],
        [-0.65, 0.4],
        [-1, 0],
      ];
      const end = [
        [0, 0],
        [-3, -20],
        [-6, -40],
        [-3, -51],
        [0, -62],
        [10, -61],
        [20, -60],
        [45, -30],
        [70, 0],
      ];
      const theta = ((-35 + 30 * arc) * Math.PI) / 180;
      const points = start.map(([u, w], i) => {
        const lx = (u * Math.cos(theta) - w * Math.sin(theta)) * radius * (1 + arc * 2.65);
        const ly = (u * Math.sin(theta) + w * Math.cos(theta)) * radius * (1 + arc * 2.65);
        return [x + lerp(lx, end[i][0] * k, fold), y + lerp(ly, end[i][1] * k, fold)];
      });
      outline.setAttribute('d', points.map(([a, b], i) => (i ? 'L' : 'M') + a + ' ' + b).join(' '));
      outline.setAttribute('fill', leaf.color);
      outline.setAttribute('fill-opacity', String(1 - fold));
      outline.style.stroke =
        'color-mix(in srgb, ' + leaf.color + ', #f7f0df ' + Math.round(fold * 100) + '%)';
      outline.setAttribute('stroke-width', String(lerp(0.7, 5 * k, fold)));
      layer.style.display = p < 0.75 ? 'block' : 'none';
      ink(p < 0.75 ? 0 : (36 + 44 * smooth((p - 0.75) / 0.25)) / 80);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);
    observer.observe(garden);
    media.addEventListener('change', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      hide();
      observer.disconnect();
      media.removeEventListener('change', schedule);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return (
    <svg
      ref={svg}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'none',
        pointerEvents: 'none',
      }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
