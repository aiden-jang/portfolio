import { firstRequestCorners } from './requestPrint';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, t: number) => from + (to - from) * t;

export function connectRequestHandoff(
  canvas: HTMLCanvasElement,
  setInTransit: (active: boolean) => void,
) {
  const source = document.querySelector<HTMLElement>('#project-iodine .undo-kept-name');
  const lane = canvas.closest('#batching-study');
  if (!source || !lane) return () => {};
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const mark = document.createElementNS(svg.namespaceURI!, 'polygon');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('request-handoff');
  svg.append(mark);
  let frame = 0;
  let nearby = false;
  const clear = () => {
    svg.remove();
    source.removeAttribute('data-lifted');
    setInTransit(false);
  };
  const paint = () => {
    frame = 0;
    if (!nearby || preference.matches) return clear();
    const seam = lane.getBoundingClientRect().top;
    const t = clamp((innerHeight * 0.91 - seam) / (innerHeight * 0.7));
    if (t === 0 || t === 1) return clear();
    const bounds = source.getBoundingClientRect();
    const line = getComputedStyle(source, '::after');
    const bottom = bounds.bottom - parseFloat(line.bottom);
    const top = bottom - parseFloat(line.height);
    const from = [
      { x: bounds.left, y: top },
      { x: bounds.right, y: top },
      { x: bounds.right, y: bottom },
      { x: bounds.left, y: bottom },
    ];
    const to = firstRequestCorners(canvas.getBoundingClientRect());
    const travel = t * t * (3 - 2 * t);
    mark.setAttribute(
      'points',
      from
        .map(
          (p, i) =>
            mix(p.x, to[i].x, travel).toFixed(2) + ',' + mix(p.y, to[i].y, travel).toFixed(2),
        )
        .join(' '),
    );
    const y = mix(top, to[0].y, travel);
    const ink = clamp((y - seam + 9) / 18);
    mark.setAttribute(
      'fill',
      'rgb(' +
        [mix(255, 244, ink), mix(200, 186, ink), mix(150, 145, ink)].map(Math.round).join(' ') +
        ')',
    );
    if (!svg.isConnected) document.body.append(svg);
    source.setAttribute('data-lifted', '');
    setInTransit(true);
  };
  const schedule = () => {
    if (!frame && nearby) frame = requestAnimationFrame(paint);
  };
  const visible = new IntersectionObserver(([entry]) => {
    nearby = entry.isIntersecting;
    if (nearby) schedule();
    else clear();
  });
  visible.observe(lane);
  const size = new ResizeObserver(schedule);
  size.observe(canvas);
  size.observe(source);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  return () => {
    clear();
    cancelAnimationFrame(frame);
    visible.disconnect();
    size.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    preference.removeEventListener('change', schedule);
  };
}
