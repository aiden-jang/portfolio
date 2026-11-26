import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useScrollArrival } from '../../hooks/scrollArrival';
import { easedProgress, useScrollStudy } from '../../hooks/useScrollStudy';
import { BeanRoom } from './BeanRoom';
import { BeanMatch } from './BeanMatch';
import { IguessReplay } from './IguessReplay';

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
  const held = useRef(false);
  const sticky = useRef(false);
  const frame = useRef(0);
  const step = useRef(0);
  const destination = useRef(0);
  const previous = useRef(-1);
  const seenDrawing = useRef(false);
  const lastLight = useRef(-1);
  const [drawingActive, setDrawingActive] = useState(true);
  const [print, setPrint] = useState<HTMLCanvasElement | null>(null);
  const paint = useCallback((laneElement: HTMLElement, t: number) => {
    const scene = room.current!,
      sketch = drawing.current!,
      stage = pin.current!;
    laneElement.dataset.duetProgress = String(t);
    if (held.current && sticky.current) return;
    const prior = previous.current;
    const direct = prior < 0 || Math.abs(t - prior) > 0.38;
    previous.current = t;
    const finish = sticky.current && t >= 0.34;
    if (finish && laneElement.dataset.finishCat !== 'true')
      laneElement.dispatchEvent(new Event('finish-cat'));
    laneElement.dataset.finishCat = String(finish);
    const light = sticky.current ? easedProgress(t, 0.78, 1) : 1;
    const updateRoom = () => {
      scene.dataset.sceneProgress = String(light);
      scene.dispatchEvent(new CustomEvent('project-scene-progress', { detail: light }));
    };
    if (lastLight.current !== light) {
      lastLight.current = light;
      updateRoom();
    }
    function state(next: 'static' | 'draw' | 'jump' | 'room') {
      laneElement.dataset.match = next;
      const hideSketch = next === 'room';
      if (sketch.inert !== hideSketch) {
        sketch.inert = hideSketch;
        setDrawingActive(!hideSketch);
      }
      const locked = next === 'draw' || next === 'jump';
      if (scene.inert !== locked) {
        scene.inert = locked;
        updateRoom();
      }
    }
    const fast = laneElement.hasAttribute('data-scene-arrival');
    const target = !sticky.current
      ? 1
      : t >= (fast ? 0.4 : 0.49)
        ? 1
        : t < 0.32
          ? 0
          : destination.current;
    const stageBox = stage.getBoundingClientRect();
    const stageInView = stageBox.top < innerHeight * 0.48 && stageBox.bottom > innerHeight * 0.52;
    if (!stageInView) seenDrawing.current = false;
    else if (target === 0 && t <= 0.36) seenDrawing.current = true;
    const skip = fast || direct || (target === 1 && t >= 0.96);
    const canShowQuickJump =
      target === 1 &&
      stageInView &&
      location.hash !== '#project-mrrp' &&
      (frame.current > 0 || (seenDrawing.current && destination.current === 0));
    if (!sticky.current || (skip && !canShowQuickJump) || (target === 0 && t === 0)) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      destination.current = step.current = target;
      state(sticky.current ? (target ? 'room' : 'draw') : 'static');
      return;
    }
    if (destination.current === target && (frame.current || step.current === target)) return;
    destination.current = target;
    cancelAnimationFrame(frame.current);
    const box = stageBox;
    const board = sketch.querySelector('canvas')!.getBoundingClientRect();
    const bean = scene.querySelector('[data-object="bean"]')?.getBoundingClientRect();
    const sx = board.left + board.width / 2 - box.left,
      sy = board.top + board.height / 2 - box.top;
    const ex = bean ? bean.left + bean.width / 2 - box.left : box.width * 0.5;
    const ey = bean ? bean.top + bean.height / 2 - box.top : box.height * 0.7;
    const sw = Math.max(1, 360 * Math.min(board.width / 960, board.height / 605));
    const ew = Math.max(55, Math.min(box.width * 0.26, box.height * 0.19));
    const from = step.current,
      start = performance.now(),
      duration = (skip ? 910 : 1120) * Math.abs(target - from);
    const radius = Math.hypot(Math.max(ex, box.width - ex), Math.max(ey, box.height - ey));
    const sprite = stage.querySelector<SVGElement>('.bean-match')!;
    const side = ex > box.width * 0.58 ? -1 : 1;
    const hopWidth = Math.min(212, box.width * 0.22);
    const crest = Math.min(sy, ey) - Math.min(146, box.height * 0.25);
    let elapsed = 0;
    let lastFrameAt = start;
    state('jump');
    function tick(now: number) {
      elapsed += Math.min(50, now - lastFrameAt);
      lastFrameAt = now;
      const time = Math.min(1, elapsed / Math.max(duration, 1));
      const p = from + (target - from) * time;
      step.current = p;
      const flight = easedProgress(p, 0.26, 0.88);
      const arc = Math.sin(Math.PI * flight);
      const x = sx + (ex - sx) * flight + side * hopWidth * arc;
      const y =
        p < 0.55
          ? sy + (crest - sy) * easedProgress(p, 0.26, 0.55)
          : crest + (ey - crest) * easedProgress(p, 0.55, 0.88);
      const beanWidth = sw + (ew - sw) * flight;
      const ink = easedProgress(p, 0.14, 0.26);
      const landing = easedProgress(p, 0.87, 0.97);
      const tilt = arc * side * -10;
      sprite.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${tilt}deg) scale(${beanWidth / sw})`;
      sprite.style.width = sw + 'px';
      sprite.style.opacity = String(ink * (1 - landing));
      laneElement.style.setProperty('--ink-visible', String(1 - ink));
      laneElement.dataset.blink = String(p < 0.27);
      const open = easedProgress(p, 0.45, 0.96);
      scene.style.clipPath = `circle(${open * radius}px at ${ex}px ${ey}px)`;
      if (time < 1) frame.current = requestAnimationFrame(tick);
      else {
        frame.current = 0;
        state(target ? 'room' : 'draw');
      }
    }
    tick(start);
  }, []);
  useScrollStudy(lane, true, paint);
  const arrive = useCallback(
    (active: boolean) => {
      const el = lane.current;
      if (!el || held.current) return;
      if (active) el.dispatchEvent(new Event('settle-drawing'));
      paint(el, Number(el.dataset.duetProgress) || 0);
    },
    [paint],
  );
  useScrollArrival(lane, true, arrive);
  useEffect(() => {
    const el = lane.current!,
      stage = pin.current!,
      canvas = drawing.current!.querySelector('canvas')!;
    const grip = (event: Event) => {
      held.current = (event as CustomEvent<boolean>).detail;
      if (!held.current) paint(el, Number(el.dataset.duetProgress) || 0);
    };
    el.addEventListener('drawing-grip', grip);
    const measure = () => {
      sticky.current = getComputedStyle(stage).position === 'sticky';
      previous.current = -1;
      if (el.dataset.duetProgress !== undefined) paint(el, Number(el.dataset.duetProgress));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(canvas);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    preference.addEventListener('change', measure);
    measure();
    const seek = () => {
      const draw = location.hash === '#project-iguess';
      if (!draw && location.hash !== '#project-mrrp') return;
      if (getComputedStyle(stage).position !== 'sticky') {
        const shot = draw ? drawing.current : room.current;
        const header =
          document.querySelector('.portfolio-header')?.getBoundingClientRect().height ?? 0;
        if (shot)
          scrollTo({
            top: scrollY + shot.getBoundingClientRect().top - header,
            behavior: 'instant',
          });
        return;
      }
      scrollTo({
        top:
          scrollY +
          el.getBoundingClientRect().top -
          parseFloat(getComputedStyle(stage).top) +
          (el.offsetHeight - stage.offsetHeight) * (draw ? 0.14 : 0.83),
        behavior: 'instant',
      });
    };
    let jumpFrame = 0;
    const queueSeek = () => {
      cancelAnimationFrame(jumpFrame);
      // Wait for the browser's native fragment scroll and any new project layout.
      jumpFrame = requestAnimationFrame(() => {
        jumpFrame = requestAnimationFrame(seek);
      });
    };
    queueSeek();
    addEventListener('hashchange', queueSeek);
    return () => {
      cancelAnimationFrame(frame.current);
      observer.disconnect();
      el.removeEventListener('drawing-grip', grip);
      preference.removeEventListener('change', measure);
      cancelAnimationFrame(jumpFrame);
      removeEventListener('hashchange', queueSeek);
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
          <IguessReplay active={drawingActive} onPrint={setPrint} />
          <span className="sr-only" role="status">
            {print && 'Your drawing is framed in Bean’s room.'}
          </span>
        </article>
        <BeanMatch />
        <article ref={room} id="project-mrrp" className="room-shot">
          <header className="cut-id">
            <h3>mrrp</h3>
            {roomLink}
          </header>
          <BeanRoom print={print} />
        </article>
      </div>
    </div>
  );
}
