import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { useScrollArrival } from '../../hooks/scrollArrival';
import { useScrollStudy } from '../../hooks/useScrollStudy';
import './batching-spread.css';

import { RequestPulse } from './RequestPulse';

const replayDuration = 960;
const scrollPlayback =
  '(prefers-reduced-motion: no-preference) and (min-height: 700px), ' +
  '(prefers-reduced-motion: no-preference) and (590px <= height < 700px) and (max-width: 767px)';
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
  const arrivalProgress = useRef<number | null>(null);
  const landOnBatch = useCallback((active: boolean) => {
    const element = figure.current;
    arrivalProgress.current = active ? 0 : null;
    if (!active || !element || !matchMedia(scrollPlayback).matches) return;
    element.dataset.driver = 'scroll';
    element.style.setProperty('--batch-scroll-time', replayDuration + 'ms');
    paintRequestPulse(element, 1, { catchUp: true });
  }, []);
  useScrollArrival(lane, true, landOnBatch, figure);
  useScrollStudy(lane, true, relayBatchProgress);

  function show(next: typeof phase) {
    manual.current = window.scrollY;
    if (figure.current) {
      figure.current.dataset.driver = 'controls';
      paintRequestPulse(figure.current, next === 'after' ? 1 : 0, { instant: true });
    }
    setPhase(next);
  }

  useEffect(() => {
    const stage = lane.current;
    const element = figure.current;
    if (!stage || !element) return;
    const motion = matchMedia(scrollPlayback);
    const showStill = () => {
      delete element.dataset.driver;
      paintRequestPulse(element, 1, { instant: true });
      setPhase('after');
    };
    const update = (event: Event) => {
      if (!motion.matches) {
        showStill();
        return;
      }
      const p = (event as CustomEvent<number>).detail;

      const override = manual.current;
      if (override !== null) {
        if (Math.abs(window.scrollY - override) < 18) return;
        manual.current = null;
      }
      const arrival = arrivalProgress.current;
      if (arrival !== null) {
        if (p >= arrival - 0.04) {
          arrivalProgress.current = Math.max(p, arrival);
          return;
        }
        arrivalProgress.current = null;
      }
      const progress = Math.min(1, p / 0.72);
      element.dataset.driver = 'scroll';
      element.style.setProperty(
        '--batch-scroll-time',
        Math.round(progress * replayDuration) + 'ms',
      );
      paintRequestPulse(element, progress);
    };
    const resetArrival = () => {
      arrivalProgress.current = null;
      if (!motion.matches) showStill();
    };
    motion.addEventListener('change', resetArrival);
    stage.addEventListener('batching-progress', update);
    return () => {
      motion.removeEventListener('change', resetArrival);
      stage.removeEventListener('batching-progress', update);
    };
  }, [lane]);

  const onPulsePaint = useCallback((position: number) => {
    setPhase(position >= 0.95 ? 'after' : position >= 0.25 ? 'batching' : 'before');
  }, []);
  const after = phase === 'after';
  return (
    <figure
      ref={figure}
      className="batching-spread"
      data-phase={phase}
      aria-label="Request batching comparison"
    >
      <RequestPulse onPaint={onPulsePaint} />
      <div className="batching-readout">
        {after
          ? '1 request · 2s load time'
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

function paintRequestPulse(
  figure: HTMLElement,
  value: number,
  options?: { instant?: boolean; catchUp?: boolean },
) {
  figure.dataset.pulse = String(value);
  figure.dispatchEvent(new CustomEvent('pulse-position', { detail: { value, ...options } }));
}
