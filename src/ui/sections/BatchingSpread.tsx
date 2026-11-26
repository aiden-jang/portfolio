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

import { BatchingLineItems } from './BatchingLineItems';
import { RequestPulse } from './RequestPulse';

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
  const settled = useRef(false);
  const landOnBatch = useCallback((active: boolean) => {
    settled.current = active;
    const element = figure.current;
    if (!element) return;
    if (active) {
      element.dataset.driver = 'scroll';
      element.style.setProperty('--batch-scroll-time', replayDuration + 'ms');
      paintRequestPulse(element, 1, true);
      setPhase('after');
    }
  }, []);
  useScrollArrival(lane, true, landOnBatch);
  useScrollStudy(lane, true, relayBatchProgress);

  function show(next: typeof phase) {
    manual.current = window.scrollY;
    if (figure.current) {
      figure.current.dataset.driver = 'controls';
      paintRequestPulse(figure.current, next === 'after' ? 1 : 0, true);
    }
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
        paintRequestPulse(element, 1, true);
        setPhase('after');
        return;
      }
      const p = (event as CustomEvent<number>).detail;

      const override = manual.current;
      if (override !== null) {
        if (Math.abs(window.scrollY - override) < 18) return;
        manual.current = null;
      }
      if (settled.current) {
        if (element.dataset.phase !== 'after') paintRequestPulse(element, 1, true);
        return;
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
      settled.current = false;
    };
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    preference.addEventListener('change', resetArrival);
    stage.addEventListener('batching-progress', update);
    return () => {
      preference.removeEventListener('change', resetArrival);
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
      <div className="batching-visuals">
        <div className="batching-pattern">
          <RequestPulse onPaint={onPulsePaint} />
          <div className="batching-readout">
            {after
              ? '1 batched request'
              : phase === 'batching'
                ? 'Batching requests'
                : '120 separate requests'}
          </div>
        </div>
        <BatchingLineItems loaded={after} />
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

function paintRequestPulse(figure: HTMLElement, value: number, instant = false) {
  figure.dataset.pulse = String(value);
  figure.dispatchEvent(new CustomEvent('pulse-position', { detail: { value, instant } }));
}
