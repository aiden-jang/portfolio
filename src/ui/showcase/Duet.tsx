import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { easedProgress, useScrollStudy } from '../../hooks/useScrollStudy';
import { BeanRoom } from './BeanRoom';
import { IguessReplay } from './IguessReplay';

const revealRange = [0.53, 0.69] as const;

function settleDuet(progress: number) {
  if (progress <= 0.53 || progress >= 0.73) return progress;
  return progress < 0.64 ? 0.53 : 0.75;
}

export function Duet({
  drawTitle,
  drawLink,
  roomLink,
}: {
  drawTitle: ReactNode;
  drawLink: ReactNode;
  roomLink: ReactNode;
}) {
  const lane = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLElement>(null);
  const room = useRef<HTMLElement>(null);
  const layout = useRef({ radius: 0, sticky: false });
  const lastLight = useRef<number>();
  const [drawingActive, setDrawingActive] = useState(true);
  const paint = useCallback((laneElement: HTMLElement, t: number) => {
    if (!room.current || !drawing.current || !pin.current) return;
    laneElement.dataset.duetProgress = String(t);
    const { sticky: animated, radius } = layout.current;
    const reveal = animated ? easedProgress(t, ...revealRange) : 1;
    const light = animated ? Math.min(1, Math.max(0, (t - 0.69) / 0.31)) : 1;
    room.current.style.setProperty('--iris', reveal * radius + 'px');
    const covered = animated && reveal >= 0.92;
    if (drawing.current.inert !== covered) {
      drawing.current.inert = covered;
      setDrawingActive(!covered);
    }
    const roomInert = animated && reveal < 0.92;
    const interactionChanged = room.current.inert !== roomInert;
    if (interactionChanged) room.current.inert = roomInert;
    if (lastLight.current === light && !interactionChanged) return;
    lastLight.current = light;
    room.current.dataset.sceneProgress = String(light);
    room.current.dispatchEvent(new CustomEvent('project-scene-progress', { detail: light }));
  }, []);
  useScrollStudy(lane, true, paint, settleDuet, revealRange, 0.025);
  useEffect(() => {
    const el = lane.current!,
      stage = pin.current!,
      canvas = drawing.current!.querySelector('canvas')!;
    const measure = () => {
      const a = stage.getBoundingClientRect(),
        b = canvas.getBoundingClientRect();
      const x = b.left - a.left + b.width * 0.43,
        y = b.top - a.top + b.height * 0.53;
      layout.current = {
        radius: Math.hypot(Math.max(x, a.width - x), Math.max(y, a.height - y)) + 2,
        sticky: getComputedStyle(stage).position === 'sticky',
      };
      el.style.setProperty('--iris-x', x + 'px');
      el.style.setProperty('--iris-y', y + 'px');
      if (el.dataset.duetProgress !== undefined) paint(el, Number(el.dataset.duetProgress));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(canvas);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    preference.addEventListener('change', measure);
    measure();
    const seek = () => {
      if (location.hash !== '#project-mrrp') return;
      if (getComputedStyle(stage).position !== 'sticky') {
        room.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
        return;
      }
      scrollTo({
        top:
          scrollY +
          el.getBoundingClientRect().top -
          parseFloat(getComputedStyle(stage).top) +
          (el.offsetHeight - stage.offsetHeight) * 0.7,
        behavior: 'instant',
      });
    };
    const initial = requestAnimationFrame(seek);
    addEventListener('hashchange', seek);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', measure);
      cancelAnimationFrame(initial);
      removeEventListener('hashchange', seek);
    };
  }, [paint]);
  return (
    <div ref={lane} className="duet">
      <div ref={pin} className="duet-stage" data-study-pin>
        <article ref={drawing} id="project-iguess" className="sketch">
          <header className="cut-id">
            <h3>{drawTitle}</h3>
            {drawLink}
          </header>
          <IguessReplay active={drawingActive} />
        </article>
        <article ref={room} id="project-mrrp" className="room-shot">
          <header className="cut-id">
            <h3>mrrp</h3>
            {roomLink}
          </header>
          <BeanRoom />
        </article>
      </div>
    </div>
  );
}
