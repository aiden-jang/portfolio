import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { DrawingPad } from './playable/DrawingPad';
import type { PlantedFlower } from './playable/gardenFlowers';
import { createPaper, W, H } from './playable/portrait';
import { identity, printedAreaOnScreen, type SheetGeometry } from './playable/sheetGeometry';
import { LeafHandoff } from './playable/LeafHandoff';
import './playable/fullscreen-drawing.css';
import './playable/studio-room.css';
import './playable/evening-exhibit.css';

const StudioRoom = lazy(() =>
  import('./playable/StudioRoom').then(({ Room }) => ({ default: Room })),
);

function smooth(n: number) {
  const t = Math.min(1, Math.max(0, n));
  return t * t * (3 - 2 * t);
}

export function Duet({
  flower,
  backToGarden,
  drawTitle,
  drawLink,
  roomLink,
}: {
  flower: PlantedFlower | null;
  backToGarden: () => void;
  drawTitle: ReactNode;
  drawLink: ReactNode;
  roomLink: ReactNode;
}) {
  const lane = useRef<HTMLDivElement>(null),
    desk = useRef<HTMLDivElement>(null),
    room = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null),
    board = useRef<HTMLCanvasElement>(null),
    print = useRef<HTMLCanvasElement>(null);
  const stop = useRef<HTMLElement>(null),
    landing = useRef<number | null>(null);
  const focusAfter = useRef<'desk' | 'room' | null>(null);
  const schedule = useRef<() => void>(() => {});
  const [master] = useState(createPaper);
  const geometry = useRef<SheetGeometry>({ screen: identity, print: identity });
  const [marked, setMarked] = useState(false);
  const [state, setState] = useState<'desk' | 'flight' | 'room' | 'static'>('desk');
  const [warm, setWarm] = useState(
    location.hash === '#project-mrrp' || location.hash.startsWith('#sill/'),
  );
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const redraw = useCallback(() => {
    const canvas = print.current,
      ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(master, 0, 0);
    }
    setMarked(master.dataset.marked === 'true');
  }, [master]);

  const roomReady = useCallback(() => {
    redraw();
    schedule.current();
  }, [redraw]);
  useEffect(() => {
    const el = lane.current;
    if (!el || warm) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setWarm(true);
          observer.disconnect();
        }
      },
      { rootMargin: '140% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [warm]);

  useLayoutEffect(() => {
    const el = lane.current!,
      paper = board.current!,
      deskPin = desk.current!,
      roomPin = room.current!;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0,
      listening = false,
      lastState = '';
    function changeMode(next: typeof state) {
      if (next === lastState) return;
      lastState = next;
      el.dataset.mode = next;
      deskPin.inert = next === 'flight' || next === 'room';
      roomPin.inert = next === 'flight' || next === 'desk';
      setState(next);
      if (focusAfter.current === next) {
        const target = next === 'room' ? 'studio-room-title' : 'studio-desk-title';
        requestAnimationFrame(() =>
          document.getElementById(target)?.focus({ preventScroll: true }),
        );
        focusAfter.current = null;
      }
    }
    function paint() {
      frame = 0;
      const camera = world.current,
        art = print.current;
      const sceneRect = el.getBoundingClientRect();
      if (preference.matches) {
        if (camera) camera.style.removeProperty('transform');
        landing.current = null;
        changeMode('static');
        return;
      }
      const distance = stop.current!.offsetTop;
      const inset = parseFloat(getComputedStyle(deskPin).top) || 0;
      const raw = (inset - sceneRect.top) / Math.max(1, distance);
      const t = Math.max(0, Math.min(1, (raw - 0.12) / 0.78));
      el.dataset.flight = t.toFixed(3);
      landing.current = t > 0 && t < 1 ? t : null;
      const ready = camera && art && art.offsetWidth && art.parentElement?.dataset.positioned;
      if (t <= 0 || (t >= 1 && ready)) {
        if (camera) camera.style.removeProperty('transform');
        el.style.setProperty('--room-mix', t <= 0 ? '0' : '1');
        el.style.setProperty('--tools-mix', t <= 0 ? '0' : '1');
        changeMode(t <= 0 ? 'desk' : 'room');
        return;
      }
      changeMode('flight');
      if (!ready) {
        el.style.setProperty('--room-mix', '0');
        el.style.setProperty('--tools-mix', '0');
        return;
      }
      // At takeoff the painted paper in the room sits exactly over the visitor’s ink.
      const field = camera.parentElement!.getBoundingClientRect();
      const source = printedAreaOnScreen(paper, geometry.current);
      const layer = art.parentElement!;
      const fx = layer.offsetLeft + art.offsetLeft + art.offsetWidth / 2;
      const fy = layer.offsetTop + art.offsetTop + art.offsetHeight / 2;
      const ix = source.x - field.left,
        iy = source.y - field.top;
      const fittedWidth = Math.min(art.offsetWidth, (art.offsetHeight * W) / H);
      const zoom = source.width / fittedWidth;
      const q = smooth(t);
      const scale = zoom ** (1 - q);
      const cx = ix + (fx - ix) * q,
        cy = iy + (fy - iy) * q;
      camera.style.transform = `matrix(${scale},0,0,${scale},${cx - scale * fx},${cy - scale * fy})`;
      el.style.setProperty('--room-mix', String(smooth(t / 0.09)));
      el.style.setProperty('--tools-mix', String(smooth((t - 0.77) / 0.23)));
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    schedule.current = queue;
    const near = new IntersectionObserver(
      (entries) => {
        const active = entries.some((entry) => entry.isIntersecting);
        if (active !== listening) {
          listening = active;
          if (active) window.addEventListener('scroll', queue, { passive: true });
          else window.removeEventListener('scroll', queue);
        }
        queue();
      },
      { rootMargin: '110% 0px' },
    );
    near.observe(el);
    const resize = new ResizeObserver(queue);
    resize.observe(el);
    resize.observe(deskPin);
    resize.observe(roomPin);
    resize.observe(paper);
    const media = () => {
      setReduced(preference.matches);
      queue();
    };
    preference.addEventListener('change', media);
    paint();
    return () => {
      cancelAnimationFrame(frame);
      near.disconnect();
      resize.disconnect();
      window.removeEventListener('scroll', queue);
      preference.removeEventListener('change', media);
      schedule.current = () => {};
    };
  }, []);

  function go(target: 'desk' | 'room') {
    const id = target === 'desk' ? 'project-iguess' : 'project-mrrp';
    const anchor = document.getElementById(id);
    if (!anchor) return;
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    if (reduced) {
      anchor.scrollIntoView({ block: 'start', behavior: 'instant' });
      document
        .getElementById(target === 'desk' ? 'studio-desk-title' : 'studio-room-title')
        ?.focus({ preventScroll: true });
    } else {
      focusAfter.current = target;
      anchor.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  return (
    <div ref={lane} className="studio-route" data-mode={state}>
      <article
        id="project-iguess"
        className="studio-desk-track"
        aria-labelledby="studio-desk-title"
      >
        <div ref={desk} className="studio-desk-pin">
          <DrawingPad
            master={master}
            board={board}
            geometry={geometry}
            active={state === 'desk' || state === 'static'}
            drawingChanged={redraw}
            title={drawTitle}
            link={drawLink}
            hang={() => go('room')}
          />
        </div>
      </article>
      <article
        ref={stop}
        id="project-mrrp"
        tabIndex={-1}
        className="studio-room-track"
        aria-label="Bean’s room in mrrp"
      >
        <div className="studio-room-run">
          <div ref={room} className="studio-room-pin">
            {warm && (
              <Suspense fallback={null}>
                <StudioRoom
                  flower={flower}
                  backToGarden={backToGarden}
                  active={state === 'room' || state === 'static'}
                  marked={marked}
                  master={master}
                  parts={{ world, print, landing }}
                  onReady={roomReady}
                  reduced={reduced}
                  roomLink={roomLink}
                  returnToPad={() => go('desk')}
                />
              </Suspense>
            )}
          </div>
        </div>
      </article>
      <LeafHandoff lane={lane} board={board} geometry={geometry} />
    </div>
  );
}
