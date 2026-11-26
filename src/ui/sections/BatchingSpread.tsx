import { useCallback, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from '../../hooks/reducedMotion';
import { useScrollArrival } from '../../hooks/scrollArrival';
import { useScrollStudy } from '../../hooks/useScrollStudy';
import { RequestPulse } from './RequestPulse';
import './batching-spread.css';

export function BatchingSpread({ lane }: { lane: RefObject<HTMLDivElement> }) {
  const [phase, setPhase] = useState<'before' | 'batching' | 'after'>('before');
  const figure = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const arrivalProgress = useRef<number | null>(null);
  const landOnBatch = useCallback((active: boolean) => {
    const element = figure.current;
    arrivalProgress.current = active ? 0 : null;
    if (active && element) paintRequestPulse(element, 1, { catchUp: true });
  }, []);
  useScrollArrival(lane, !reducedMotion, landOnBatch, figure);

  const draw = useCallback(
    (_stage: HTMLElement, progress: number) => {
      const element = figure.current;
      if (!element) return;
      if (reducedMotion) {
        arrivalProgress.current = null;
        paintRequestPulse(element, 1, { instant: true });
        return;
      }
      const arrival = arrivalProgress.current;
      if (arrival !== null) {
        if (progress >= arrival - 0.04) {
          arrivalProgress.current = Math.max(progress, arrival);
          return;
        }
        arrivalProgress.current = null;
      }
      paintRequestPulse(element, Math.min(1, progress / 0.72));
    },
    [reducedMotion],
  );
  useScrollStudy(lane, true, draw);

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
