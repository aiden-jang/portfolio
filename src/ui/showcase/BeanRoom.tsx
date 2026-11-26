import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RoomAction, RoomPositions } from './mrrp/renderer.js';
import { useReducedMotion } from '../../hooks/reducedMotion';
import './bean-room.css';
import { BeanRoomTargets } from './BeanRoomTargets';
import { useRoomCamera } from './roomCamera';
import { useBeanRoomRenderer } from './useBeanRoomRenderer';
import { useBeanToyDrag } from './useBeanToyDrag';
import { useIdleDetail } from './useIdleDetail';

const bean = {
  name: 'Bean',
  fur: '#e39348',
  furDk: '#b96d38',
  belly: '#fbefdb',
  eyes: '#7cb342',
  tabby: true,
};

function roomClock(hour: number) {
  const utc = new Date().getUTCHours();
  const offset = ((utc - hour + 36) % 24) - 12;
  return {
    tz: offset === 0 ? 'UTC' : `Etc/GMT${offset > 0 ? '+' : ''}${offset}`,
    homeHour: 18,
  };
}

export function BeanRoom({ print }: { print?: HTMLCanvasElement | null }) {
  const room = useRef<HTMLDivElement>(null);
  useIdleDetail(room);
  const live = useRef<HTMLDivElement>(null);
  const [painted, setPainted] = useState(false);
  const onFirstFrame = useCallback(() => setPainted(true), []);
  const fade = useRef<HTMLCanvasElement>(null);
  const hotspots = useRef<HTMLDivElement>(null);
  const welcomed = useRef(false);
  const toyCue = useRef<'waiting' | 'played' | 'manual'>('waiting');
  const [action, setAction] = useState<{
    kind: RoomAction;
    count: number;
  } | null>(null);
  const boxed = action?.kind === 'box';
  const [together, setTogether] = useState(false);
  const [morning, setMorning] = useState(false);
  const lightOn = useRef(false);
  const manualAt = useRef<number>();
  const progress = useRef(0);
  const [pets, setPets] = useState(0);
  const [petAt, setPetAt] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const clock = useMemo(() => roomClock(morning ? 9 : 18), [morning]);

  const leaveRoom = useCallback(() => {
    setPainted(false);
    setAction((current) => (current?.kind === 'box' || current?.kind === 'sit' ? current : null));
    setPetAt(null);
  }, []);
  const { near, Renderer, failed } = useBeanRoomRenderer(room, leaveRoom);
  const reduced = useReducedMotion();
  useRoomCamera(live, near && !!Renderer, reduced);

  useEffect(() => {
    const article = room.current?.closest('article');
    if (!Renderer || !near || !article || welcomed.current) return;
    let inFrame = false;
    const welcome = () => {
      if (!inFrame || article.inert || welcomed.current) return;
      welcomed.current = true;
      setAction((current) => current ?? { kind: 'welcome', count: 0 });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inFrame = (entry?.intersectionRatio ?? 0) >= 0.47;
        welcome();
      },
      { threshold: 0.47 },
    );
    observer.observe(article);
    article.addEventListener('project-scene-progress', welcome);
    return () => {
      observer.disconnect();
      article.removeEventListener('project-scene-progress', welcome);
    };
  }, [Renderer, near]);

  const onPositions = useCallback((positions: RoomPositions) => {
    const layer = hotspots.current;
    const frame = live.current;
    if (!layer || !frame) return;
    const center = String(positions.center);
    const artCenter = String((positions.center + positions.picture) / 2 + 0.004);
    if (frame.style.getPropertyValue('--bean-picture-focus-x') !== artCenter)
      frame.style.setProperty('--bean-picture-focus-x', artCenter);
    if (frame.style.getPropertyValue('--bean-focus-x') !== center)
      frame.style.setProperty('--bean-focus-x', center);
    for (const name of ['bean', 'mouse', 'box'] as const) {
      const x = (positions[name][0] * 100).toFixed(2) + '%';
      const y = (positions[name][1] * 100).toFixed(2) + '%';
      if (layer.style.getPropertyValue('--' + name + '-x') !== x)
        layer.style.setProperty('--' + name + '-x', x);
      if (layer.style.getPropertyValue('--' + name + '-y') !== y)
        layer.style.setProperty('--' + name + '-y', y);
    }
    if (!layer.dataset.positioned) layer.dataset.positioned = 'true';
  }, []);

  function interact(kind: RoomAction) {
    toyCue.current = 'manual';
    setAction((current) => ({ kind, count: (current?.count ?? 0) + 1 }));
  }

  function pet() {
    interact('pet');
    setPetAt(Date.now());
    setPets((count) => count + 1);
    setStatus('Bean leans in and gives you a little mrrp.');
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
      if (progress.current < 0.05 && toyCue.current === 'played') toyCue.current = 'waiting';
      const canPlay = !scene.inert && toyCue.current === 'waiting' && welcomed.current;
      if (progress.current >= 0.18 && canPlay) {
        toyCue.current = 'played';
        setAction((current) => ({
          kind: 'mouse',
          count: (current?.count ?? 0) + 1,
        }));
      }
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

  function playWithMouse() {
    interact('mouse');
    setStatus('Bean crouches and pounces on the toy mouse.');
  }

  const { toy, toyDrag, onMouse } = useBeanToyDrag(hotspots, playWithMouse, () => {
    toyCue.current = 'manual';
    setAction(null);
  });

  function playWithBox() {
    if (boxed) {
      setAction(null);
      setStatus('Bean climbs out of the box.');
    } else {
      interact('box');
      setStatus('Bean hides in the box, then peeks over the edge.');
    }
  }

  const targets = {
    boxed,
    onPet: pet,
    onBox: playWithBox,
    onMouse,
  };
  return (
    <div
      className="bean-room"
      data-bean-used={pets > 0 || undefined}
      data-light={morning ? 'morning' : 'evening'}
      ref={room}
    >
      <div
        className="bean-window"
        data-light={morning ? 'morning' : 'evening'}
        data-painted={painted && near}
        data-has-print={!!print}
      >
        <picture className="bean-room-poster" aria-hidden={painted && near}>
          <source
            media="(max-width: 700px) and (max-height: 699px)"
            srcSet="/projects/scenes/mrrp-room-art-short.webp"
          />
          <source media="(max-width: 700px)" srcSet="/projects/scenes/mrrp-room-art-mobile.webp" />
          <img
            src="/projects/scenes/mrrp-room-art-desktop.webp"
            alt="Bean’s pixel room"
            decoding="async"
            width="900"
            height="738"
          />
        </picture>
        {Renderer && near && (
          <div className="bean-room-canvas" ref={live}>
            <Renderer
              label="Bean’s room."
              key={String(reduced)}
              roomPlay={{ action, onPositions, toy, print, onFirstFrame }}
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
            <BeanRoomTargets ref={hotspots} {...targets} toyDrag={toyDrag} />
          </div>
        )}
      </div>
      {failed ? (
        <span className="sr-only" role="status">
          The interactive room could not load. Open mrrp to visit Bean.
        </span>
      ) : (
        <div className="bean-room-controls" role="group" aria-label="Spend a moment with Bean">
          {!status && (
            <span className="bean-cue">
              {print ? 'Your drawing is on the wall.' : 'Pet Bean or drag her toy.'}
            </span>
          )}
          <button
            type="button"
            disabled={!Renderer}
            aria-pressed={together}
            onClick={() => {
              if (!together) interact('sit');
              else setAction(null);
              setTogether(!together);
              setStatus(
                together
                  ? 'You leave Bean to her quiet room.'
                  : 'Bean settles beside you and rolls onto her back.',
              );
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
