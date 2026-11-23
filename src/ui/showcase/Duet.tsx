import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { easedProgress, useScrollStudy } from '../../hooks/useScrollStudy';
import { BeanRoom } from './BeanRoom';
import { IguessReplay } from './IguessReplay';

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
  const circle = useRef({ r: 0 });
  const paint = useCallback((laneElement: HTMLElement, t: number) => {
    if (!room.current || !drawing.current || !pin.current) return;
    laneElement.dataset.duetProgress = String(t);
    const animated = getComputedStyle(pin.current).position === 'sticky';
    const reveal = animated ? easedProgress(t, 0.53, 0.69) : 1;
    const draw = animated ? Math.min(1, t / 0.48) : 1;
    const light = animated ? Math.min(1, Math.max(0, (t - 0.69) / 0.31)) : 1;
    const { r: radius } = circle.current;
    room.current.style.setProperty('--iris', reveal * radius + 'px');
    room.current.style.setProperty(
      '--close',
      String(animated ? 1 - easedProgress(t, 0.67, 0.87) : 0),
    );
    drawing.current.inert = animated && reveal > 0.8;
    room.current.inert = animated && reveal < 0.8;
    for (const [stage, p] of [
      [drawing.current, draw],
      [room.current, light],
    ] as const) {
      stage.dataset.sceneProgress = String(p);
      stage.dispatchEvent(new CustomEvent('project-scene-progress', { detail: p }));
    }
  }, []);
  useScrollStudy(lane, true, paint, settleDuet);
  useEffect(() => {
    const el = lane.current!,
      stage = pin.current!,
      canvas = drawing.current!.querySelector('canvas')!;
    const measure = () => {
      const a = stage.getBoundingClientRect(),
        b = canvas.getBoundingClientRect();
      const x = b.left - a.left + b.width * 0.5,
        y = b.top - a.top + b.height * 0.66;
      circle.current = {
        r: Math.hypot(Math.max(x, a.width - x), Math.max(y, a.height - y)) + 2,
      };
      el.style.setProperty('--iris-x', x + 'px');
      el.style.setProperty('--iris-y', y + 'px');
      if (el.dataset.duetProgress !== undefined) paint(el, Number(el.dataset.duetProgress));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(canvas);
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
          <IguessReplay />
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
