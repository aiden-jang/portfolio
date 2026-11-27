import { useEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { pointCount } from '../catDrawing';
import { stockInk } from './portrait';
import type { SheetGeometry } from './sheetGeometry';

const ear = [
  [340, 192],
  [338.5, 182],
  [337, 172],
  [335.5, 162],
  [334, 152],
  [335.5, 146.5],
  [337, 141],
  [338.5, 135.5],
  [340, 130],
  [345, 130.5],
  [350, 131],
  [355, 131.5],
  [360, 132],
  [372.5, 147],
  [385, 162],
  [397.5, 177],
  [410, 192],
] as const;

function clamp(n: number) {
  return Math.min(1, Math.max(0, n));
}
function ease(n: number) {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
}
function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function LeafHandoff({
  lane,
  board,
  geometry,
}: {
  lane: RefObject<HTMLDivElement>;
  board: RefObject<HTMLCanvasElement>;
  geometry: RefObject<SheetGeometry>;
}) {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const garden = document.getElementById('project-bloomnote');
    const stage = lane.current,
      canvas = board.current,
      layer = svg.current;
    if (!garden || !stage || !canvas || !layer) return;
    const outline = layer.querySelector('path')!;
    const vein = layer.querySelector('.leaf-vein')!;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0,
      ink = -1;
    let listening = false;
    let source: SVGEllipseElement | null = null;
    const nearby = new Set<Element>();

    function showInk(visible: number) {
      if (visible === ink) return;
      ink = visible;
      canvas!.dataset.inkPoints = String(visible);
      canvas!.dispatchEvent(new CustomEvent('studio-ink', { detail: visible }));
    }
    function finish(visible: number) {
      layer!.style.visibility = 'hidden';
      source?.removeAttribute('data-shed');
      showInk(visible);
    }
    function update() {
      frame = 0;
      const top = stage!.getBoundingClientRect().top;
      const pinnedTop =
        parseFloat(getComputedStyle(stage!.querySelector('.studio-desk-pin')!).top) || 0;
      const progress = clamp((innerHeight * 0.97 - top) / (innerHeight * 0.97 - pinnedTop));
      if (media.matches || progress >= 1 || !nearby.size) {
        finish(pointCount);
        return;
      }
      if (progress <= 0) {
        finish(0);
        return;
      }
      const leaf = garden!.querySelector<SVGEllipseElement>(
        'button[aria-pressed=true] [data-travel-leaf]',
      );
      if (!leaf) {
        finish(pointCount);
        return;
      }
      if (source !== leaf) {
        source?.removeAttribute('data-shed');
        source = leaf;
      }
      const leafTransform = leaf.getScreenCTM();
      if (!leafTransform) {
        finish(pointCount);
        return;
      }
      const revealAt = 0.75;
      if (progress >= revealAt) {
        layer!.style.visibility = 'hidden';
        source.setAttribute('data-shed', '');
        showInk(Math.round(36 + (pointCount - 36) * ease((progress - revealAt) / (1 - revealAt))));
        return;
      }
      if (Number(canvas!.dataset.markCount) > 0 && progress > 0.64) {
        finish(pointCount);
        return;
      }
      showInk(0);
      source.setAttribute('data-shed', '');
      const box = canvas!.getBoundingClientRect();
      const surface = geometry.current!.screen;
      const rx = leaf.rx.baseVal.value,
        ry = leaf.ry.baseVal.value;
      const cx = leaf.cx.baseVal.value,
        cy = leaf.cy.baseVal.value;
      const center = new DOMPoint(cx, cy).matrixTransform(leafTransform);
      const travel = ease(progress / revealAt);
      const opening = ease((progress - 0.52) / (revealAt - 0.52));
      const arc = Math.sin(travel * Math.PI);
      const paperPoint = (x: number, y: number) => ({
        x: box.left + surface.x + (203 + ((x - 259) * 595) / 441) * surface.scale,
        y: box.top + surface.y + (38 + ((y - 113) * 524) / 388) * surface.scale,
      });
      const destination = paperPoint(359, 158);
      const xCenter = mix(center.x, destination.x, travel) + arc * Math.min(164, innerWidth * 0.43);
      const yCenter =
        mix(center.y, destination.y, travel) - arc * Math.min(212, innerHeight * 0.25);
      const twist = arc * 0.98;
      const leafScale = 1 + arc * 3.7;
      const localLeaf = (theta: number) => {
        const p = new DOMPoint(
          cx + Math.cos(theta) * rx,
          cy + Math.sin(theta) * ry,
        ).matrixTransform(leafTransform);
        const x = (p.x - center.x) * leafScale,
          y = (p.y - center.y) * leafScale;
        return {
          x: x * Math.cos(twist) - y * Math.sin(twist),
          y: x * Math.sin(twist) + y * Math.cos(twist),
        };
      };
      const points = ear.map(([x, y], i) => {
        const point = localLeaf(Math.PI + (i / (ear.length - 1)) * Math.PI * 2);
        const inkPoint = paperPoint(x, y);
        const ax = xCenter + mix(point.x, inkPoint.x - destination.x, opening);
        const ay = yCenter + mix(point.y, inkPoint.y - destination.y, opening);
        return (i ? 'L' : 'M') + ax.toFixed(2) + ' ' + ay.toFixed(2);
      });
      const axis = localLeaf(0);
      vein.setAttribute(
        'd',
        `M${xCenter - axis.x * 0.68} ${yCenter - axis.y * 0.68}l${axis.x * 1.3} ${axis.y * 1.3}`,
      );
      vein.setAttribute('opacity', String(arc * (1 - opening) * 0.75));
      const stock = leaf.getAttribute('fill') || '#648442';
      outline.setAttribute('d', points.join(' '));
      outline.setAttribute('fill', stock);
      outline.setAttribute('fill-opacity', String(1 - opening));
      outline.style.stroke = `color-mix(in srgb, ${stock}, ${stockInk} ${opening * 100}%)`;
      outline.setAttribute('stroke-width', String(mix(1, 7.8 * surface.scale, opening)));
      layer!.style.visibility = 'visible';
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function observe(entries: IntersectionObserverEntry[]) {
      for (const entry of entries) {
        if (entry.isIntersecting) nearby.add(entry.target);
        else nearby.delete(entry.target);
      }
      const active = Boolean(nearby.size);
      if (active !== listening) {
        listening = active;
        if (active) window.addEventListener('scroll', schedule, { passive: true });
        else window.removeEventListener('scroll', schedule);
      }
      schedule();
    }
    const watch = new IntersectionObserver(observe, { rootMargin: '90px 0px' });
    watch.observe(garden);
    watch.observe(stage);
    const size = new ResizeObserver(schedule);
    size.observe(stage);
    size.observe(canvas);
    const selection = new MutationObserver(schedule);
    selection.observe(garden, {
      attributes: true,
      attributeFilter: ['data-selected-flower'],
    });
    media.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      watch.disconnect();
      size.disconnect();
      selection.disconnect();
      window.removeEventListener('scroll', schedule);
      media.removeEventListener('change', schedule);
      finish(pointCount);
    };
  }, [lane, board, geometry]);

  return createPortal(
    <svg ref={svg} className="studio-leaf-flight" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" />
      <path
        className="leaf-vein"
        stroke="#dfebc5"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>,
    document.body,
  );
}
