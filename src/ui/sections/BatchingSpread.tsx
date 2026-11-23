import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { prefersReducedMotion } from '../../hooks/reducedMotion';
import { useScrollStudy } from '../../hooks/useScrollStudy';
import { ControlIcon } from '../ControlIcon';
import './batching-spread.css';

const replayDuration = 960;
const marks = Array.from({ length: 120 }, (_, index) => ({
  x: 50 + (index % 12) * 47,
  y: 36 + Math.floor(index / 12) * 24,
}));

function relayBatchProgress(stage: HTMLElement, progress: number) {
  stage.dispatchEvent(new CustomEvent('batch-preview-progress', { detail: progress }));
}

export function BatchingSpread({ lane }: { lane: RefObject<HTMLDivElement> }) {
  const [phase, setPhase] = useState<'before' | 'running' | 'after'>('before');
  const figure = useRef<HTMLElement>(null);
  const manual = useRef<{ scrollY: number; until: number } | null>(null);
  useScrollStudy(lane, true, relayBatchProgress);

  function show(next: typeof phase) {
    manual.current = {
      scrollY: window.scrollY,
      until: next === 'running' ? performance.now() + replayDuration : 0,
    };
    if (figure.current) figure.current.dataset.driver = 'controls';
    setPhase(next);
  }

  useEffect(() => {
    const stage = lane.current;
    const element = figure.current;
    if (!stage || !element) return;
    const motion = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 700px)');
    const update = (event: Event) => {
      if (!motion.matches) {
        delete element.dataset.driver;
        return;
      }
      const p = (event as CustomEvent<number>).detail;
      const override = manual.current;
      if (override) {
        if (performance.now() < override.until) {
          override.scrollY = window.scrollY;
          return;
        }
        if (Math.abs(window.scrollY - override.scrollY) < 18) return;
        manual.current = null;
      }
      const progress = Math.min(1, p / 0.72);
      element.dataset.driver = 'scroll';
      element.style.setProperty(
        '--batch-scroll-time',
        Math.round(progress * replayDuration) + 'ms',
      );
      setPhase(progress >= 0.74 ? 'after' : 'before');
    };
    stage.addEventListener('batch-preview-progress', update);
    return () => stage.removeEventListener('batch-preview-progress', update);
  }, [lane]);

  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setTimeout(() => setPhase('after'), replayDuration);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const after = phase === 'after';
  return (
    <figure
      ref={figure}
      className="batching-spread"
      data-phase={phase}
      aria-label="Request batching comparison"
    >
      <div className="batching-instrument">
        <svg viewBox="0 0 640 288" aria-hidden="true">
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
                  { '--merge-x': `${309 - x}px`, '--merge-y': `${141 - y}px` } as CSSProperties
                }
              />
            ))}
          </g>
          <g className="batching-packet">
            <rect x="209" y="108" width="222" height="72" rx="7" />
            <path d="M239 144h162" />
          </g>
        </svg>
        <div className="batching-readout">
          {after ? '1 batched request' : '120 separate requests'}
        </div>
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
        <button
          type="button"
          className="batching-play"
          aria-disabled={phase === 'running'}
          onClick={() => {
            if (phase !== 'running') show(prefersReducedMotion() ? 'after' : 'running');
          }}
        >
          <ControlIcon name="play" />
          {phase === 'running' ? 'Batching…' : 'Replay batching'}
        </button>
      </div>
      <figcaption className="sr-only" aria-live="polite">
        {after
          ? 'After batching: one API call and two seconds to load.'
          : 'Before batching: 120 API calls and about 60 seconds to load.'}
      </figcaption>
    </figure>
  );
}
