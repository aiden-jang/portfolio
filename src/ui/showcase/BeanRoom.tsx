import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ComponentProps,
} from 'react';
import type { Cat } from './mrrp/renderer.js';
import './bean-room.css';

const bean = {
  name: 'Bean',
  fur: '#e39348',
  furDk: '#b96d38',
  belly: '#fbefdb',
  eyes: '#7cb342',
  tabby: true,
};

type RoomRenderer = ComponentType<ComponentProps<typeof Cat>>;
let loading: Promise<typeof import('./mrrp/renderer.js')> | undefined;

function roomClock(hour: number) {
  const utc = new Date().getUTCHours();
  const offset = ((utc - hour + 36) % 24) - 12;
  return {
    tz: offset === 0 ? 'UTC' : `Etc/GMT${offset > 0 ? '+' : ''}${offset}`,
    homeHour: 18,
  };
}

export function BeanRoom() {
  const room = useRef<HTMLDivElement>(null);
  const live = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);
  const [Renderer, setRenderer] = useState<RoomRenderer | null>(null);
  const [failed, setFailed] = useState(false);
  const [together, setTogether] = useState(false);
  const [morning, setMorning] = useState(false);
  const lightOn = useRef(false);
  const manualAt = useRef<number>();
  const progress = useRef(0);
  const [pets, setPets] = useState(0);
  const [petAt, setPetAt] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const clock = useMemo(() => roomClock(morning ? 9 : 20), [morning]);

  useEffect(() => {
    const stage = room.current;
    if (!stage) return;
    let disposed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setNear(entry.isIntersecting);
        if (!entry.isIntersecting) return;
        loading ??= import('./mrrp/renderer.js');
        void loading.then(
          ({ Cat }) => {
            if (!disposed) setRenderer(() => Cat);
          },
          () => {
            if (!disposed) setFailed(true);
          },
        );
      },
      { rootMargin: '160px 0px' },
    );
    observer.observe(stage);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);

  function pet() {
    setPets((count) => count + 1);
    setPetAt(Date.now());
    setStatus('You pet Bean.');
  }

  const changeLight = useCallback((next: boolean) => {
    if (lightOn.current === next) return;
    lightOn.current = next;
    const canvas = live.current?.querySelector('canvas[role="img"]');
    const overlay = fade.current;
    if (
      canvas instanceof HTMLCanvasElement &&
      overlay &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      overlay.getAnimations().forEach((animation) => animation.cancel());
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      overlay.getContext('2d')?.drawImage(canvas, 0, 0);
      overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 540,
        easing: 'cubic-bezier(.2,.7,.2,1)',
      });
    }
    setMorning(next);
  }, []);

  useEffect(() => {
    const scene = room.current?.closest('article');
    if (!scene) return;
    const motion = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 610px)');
    const update = (event: Event) => {
      progress.current = (event as CustomEvent<number>).detail;
      if (!motion.matches) return;
      if (manualAt.current !== undefined && Math.abs(progress.current - manualAt.current) < 0.2)
        return;
      manualAt.current = undefined;
      changeLight(progress.current >= 0.58);
    };
    scene.addEventListener('project-scene-progress', update);
    return () => scene.removeEventListener('project-scene-progress', update);
  }, [changeLight]);

  function switchLight() {
    manualAt.current = progress.current;
    changeLight(!morning);
    setStatus(morning ? 'Evening in Bean’s room.' : 'Morning in Bean’s room.');
  }

  return (
    <div className="bean-room" ref={room}>
      <div className="bean-window" data-light={morning ? 'morning' : 'evening'}>
        <picture className="bean-room-poster" aria-hidden={!!Renderer && near}>
          <source media="(max-width: 700px)" srcSet="/projects/scenes/mrrp-room-art-mobile.webp" />
          <img
            src="/projects/scenes/mrrp-room-art-desktop.webp"
            alt="Bean’s pixel room"
            loading="lazy"
            decoding="async"
            width="900"
            height="738"
          />
        </picture>
        {Renderer && near && (
          <div className="bean-room-canvas" ref={live}>
            <Renderer
              label="Bean’s room."
              look={bean}
              clock={clock}
              mood={null}
              nudge={pets}
              reserveBelow={115}
              role={null}
              petAt={petAt}
              onPet={pet}
              together={together}
              sitting={together}
              staying={together}
              satWith={together}
              spot={together ? 0.42 : null}
            />
            <canvas className="bean-light-fade" ref={fade} aria-hidden="true" />
          </div>
        )}
      </div>
      {failed ? (
        <span className="sr-only" role="status">
          The interactive room could not load. Open mrrp to visit Bean.
        </span>
      ) : (
        <div className="bean-room-controls" role="group" aria-label="Spend a moment with Bean">
          <button type="button" disabled={!Renderer} onClick={pet}>
            Pet Bean
          </button>
          <button
            type="button"
            disabled={!Renderer}
            aria-pressed={together}
            onClick={() => {
              setTogether(!together);
              setStatus(together ? 'You leave Bean to her quiet room.' : 'You sit with Bean.');
            }}
          >
            Sit together
          </button>
          <button type="button" disabled={!Renderer} aria-pressed={morning} onClick={switchLight}>
            Morning light
          </button>
        </div>
      )}
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}
