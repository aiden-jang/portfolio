import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { lastScrollInput, useScrollArrival } from '../../hooks/scrollArrival';
import { useScrollStudy } from '../../hooks/useScrollStudy';
import './batching-spread.css';

const replayDuration = 960;
const marks = Array.from({ length: 120 }, (_, index) => ({
  x: 50 + (index % 12) * 47,
  y: 36 + Math.floor(index / 12) * 24,
}));

export function BatchingGraphic({ shared = false }: { shared?: boolean }) {
  return (
    <svg
      viewBox="0 0 640 288"
      aria-hidden="true"
      className={shared ? 'batch-handoff-graphic' : undefined}
    >
      <g className="batching-marks">
        {marks.map(({ x, y }) => (
          <rect
            key={x + ':' + y}
            x={x}
            y={y}
            width="22"
            height="5"
            rx="2"
            style={
              {
                '--merge-x': `${309 - x}px`,
                '--merge-y': `${141 - y}px`,
              } as CSSProperties
            }
          />
        ))}
      </g>
      <g className="batching-packet">
        <path d="M225 144h190" />
      </g>
    </svg>
  );
}

function relayBatchProgress(stage: HTMLElement, progress: number) {
  stage.dispatchEvent(new CustomEvent('batching-progress', { detail: progress }));
}

export function BatchingSpread({ lane }: { lane: RefObject<HTMLDivElement> }) {
  const [phase, setPhase] = useState<'before' | 'batching' | 'after'>('before');
  const figure = useRef<HTMLElement>(null);
  const manual = useRef<number | null>(null);
  const arrivalTime = useRef<number | null>(null);
  const landOnBatch = useCallback((active: boolean) => {
    const element = figure.current;
    if (!element) return;
    arrivalTime.current = active ? performance.now() : null;
    if (active) {
      element.dataset.driver = 'scroll';
      element.style.setProperty('--batch-scroll-time', replayDuration + 'ms');
      setPhase('after');
    }
  }, []);
  useScrollArrival(lane, true, landOnBatch);
  useScrollStudy(lane, true, relayBatchProgress);

  function show(next: typeof phase) {
    manual.current = window.scrollY;
    if (figure.current) figure.current.dataset.driver = 'controls';
    setPhase(next);
  }

  useEffect(() => {
    const stage = lane.current;
    const element = figure.current;
    if (!stage || !element) return;
    const motion = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 700px)');
    const shortMotion = matchMedia(
      '(prefers-reduced-motion: no-preference) and (590px <= height < 700px) and (max-width: 767px)',
    );
    const hasScrollPlayback = () => motion.matches || shortMotion.matches;
    const update = (event: Event) => {
      if (!hasScrollPlayback()) {
        delete element.dataset.driver;
        return;
      }
      const p = (event as CustomEvent<number>).detail;
      if (arrivalTime.current !== null) {
        if (manual.current === null && lastScrollInput() <= arrivalTime.current) return;
        arrivalTime.current = null;
      }
      const override = manual.current;
      if (override !== null) {
        if (Math.abs(window.scrollY - override) < 18) return;
        manual.current = null;
      }
      const progress = Math.min(1, p / 0.72);
      element.dataset.driver = 'scroll';
      element.style.setProperty(
        '--batch-scroll-time',
        Math.round(progress * replayDuration) + 'ms',
      );
      setPhase(progress >= 0.76 ? 'after' : progress >= 0.32 ? 'batching' : 'before');
    };
    stage.addEventListener('batching-progress', update);
    return () => stage.removeEventListener('batching-progress', update);
  }, [lane]);

  const after = phase === 'after';
  return (
    <figure
      ref={figure}
      className="batching-spread"
      data-phase={phase}
      aria-label="Request batching comparison"
    >
      <BatchingGraphic shared />
      <div className="batching-readout">
        {after
          ? '1 batched request'
          : phase === 'batching'
            ? 'Batching requests'
            : '120 separate requests'}
      </div>
      <div className="batching-controls">
        <div className="batching-states" role="group" aria-label="Compare request patterns">
          <button type="button" aria-pressed={!after} onClick={() => show('before')}>
            Before
          </button>
          <button type="button" aria-pressed={after} onClick={() => show('after')}>
            After
          </button>
        </div>
      </div>
      <figcaption className="sr-only">
        {after
          ? 'After batching: one API call and two seconds to load.'
          : phase === 'batching'
            ? 'Combining requests.'
            : 'Before batching: 120 API calls and about 60 seconds to load.'}
      </figcaption>
    </figure>
  );
}
