import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useScrollArrival } from '../../hooks/scrollArrival';
import { easedProgress, useScrollStudy } from '../../hooks/useScrollStudy';
import { BeanRoom } from './BeanRoom';
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
  const landing = useRef<number | null>(null);
  const step = useRef(0);
  const destination = useRef(0);
  const returnAt = useRef(0.32);
  const previous = useRef(-1);
  const seenDrawing = useRef(false);
  const seenAnswer = useRef(false);
  const markAnswer = useCallback(() => {
    if (seenDrawing.current) seenAnswer.current = true;
  }, []);
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
    const stageBox = stage.getBoundingClientRect();
    const stageInView = stageBox.top < innerHeight * 0.48 && stageBox.bottom > innerHeight * 0.52;
    const answerOnScreen =
      seenDrawing.current &&
      stageInView &&
      prior >= 0 &&
      t > prior &&
      (seenAnswer.current ||
        sketch.querySelector('.iguess-replay-controls[data-verdict="true"], canvas[data-marked]'));
    let target = destination.current;
    if (!sticky.current || t >= 0.4 || (target === 0 && answerOnScreen)) target = 1;
    else if (t <= returnAt.current) target = 0;
    if (target === 1 && destination.current === 0)
      returnAt.current = Math.min(0.32, Math.max(0, t - 0.1));

    const finish = sticky.current && (t >= 0.34 || target === 1);
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
      if (next !== 'jump') {
        landing.current = null;
        scene.querySelector<HTMLElement>('.bean-room-canvas')?.style.removeProperty('transform');
      }
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
    if (!stageInView) seenDrawing.current = false;
    else if (target === 0 && t <= 0.36) seenDrawing.current = true;
    if (!stageInView || target === 1) seenAnswer.current = false;
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
    const from = step.current;
    const duration = 1720 * Math.abs(target - from);
    const requestedAt = performance.now();
    let startedAt: number | undefined;
    function tick(now: number) {
      const camera = scene.querySelector<HTMLElement>('.bean-room-canvas');
      const art = camera?.querySelector<HTMLImageElement>('.framed-strokes');
      const layer = art?.offsetParent as HTMLElement | null;
      const viewport = camera?.parentElement;
      if (
        !camera ||
        !art?.naturalWidth ||
        !layer ||
        !art.offsetWidth ||
        !layer.hasAttribute('data-positioned') ||
        viewport?.dataset.painted !== 'true'
      ) {
        // Give the live room time to paint when a swipe reaches it before the module loads.
        if (from === 0 && target === 1 && now - requestedAt < 480) {
          frame.current = requestAnimationFrame(tick);
          return;
        }
        step.current = target;
        frame.current = 0;
        state(target ? 'room' : 'draw');
        return;
      }
      if (startedAt === undefined) {
        startedAt = now;
        state('jump');
      }
      const time = Math.min(1, (now - startedAt) / Math.max(duration, 1));
      const progress = from + (target - from) * time;
      step.current = landing.current = progress;
      const frameX = layer.offsetLeft + art.offsetLeft + art.offsetWidth / 2;
      const frameY = layer.offsetTop + art.offsetTop + art.offsetHeight / 2;
      const { clientWidth: width, clientHeight: height } = camera;
      const frameShare = width > 700 ? 0.45 : 0.65;
      const close = Math.max(
        1.1,
        Math.min((width * frameShare) / art.offsetWidth, (height * 0.5) / art.offsetHeight, 8),
      );
      const pullback = easedProgress(progress, 0.16, 0.84);
      const zoom = close ** (1 - pullback);
      const offset = (zoom - 1) / (close - 1);
      const x = (width * 0.5 - close * frameX) * offset;
      const y = (height * 0.47 - close * frameY) * offset;
      camera.style.transform = `matrix(${zoom},0,0,${zoom},${x},${y})`;
      laneElement.style.setProperty('--room-ui', String(easedProgress(progress, 0.86, 1)));
      if (time < 1) frame.current = requestAnimationFrame(tick);
      else {
        frame.current = 0;
        state(target ? 'room' : 'draw');
      }
    }
    tick(requestedAt);
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
          <IguessReplay active={drawingActive} onAnswer={markAnswer} onPrint={setPrint} />
          <span className="sr-only" role="status">
            {print?.hasAttribute('data-personalized') && 'Your drawing is framed in Bean’s room.'}
          </span>
        </article>

        <article ref={room} id="project-mrrp" className="room-shot">
          <header className="cut-id">
            <h3>mrrp</h3>
            {roomLink}
          </header>
          <BeanRoom print={print} landing={landing} />
        </article>
      </div>
    </div>
  );
}
