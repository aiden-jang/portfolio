import { useCallback, useContext, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from '../../hooks/reducedMotion';
import { lastScrollInput, useScrollArrival } from '../../hooks/scrollArrival';
import { useScrollStudy } from '../../hooks/useScrollStudy';
import { RequestPulse } from './RequestPulse';
import { ControlIcon } from '../ControlIcon';
import { batchingStory, OpenEvidence } from '../creative/evidenceNavigation';
import { evidenceHref } from '../creative/storyRoutes';
import './batching-spread.css';

export function BatchingSpread({ lane }: { lane: RefObject<HTMLDivElement> }) {
  const [phase, setPhase] = useState<'before' | 'batching' | 'after'>('before');
  const open = useContext(OpenEvidence);
  const figure = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const arrivalProgress = useRef<number | null>(null);
  const previousProgress = useRef(0);
  const landOnBatch = useCallback(
    (active: boolean) => {
      const element = figure.current;
      const track = lane.current;
      const pin = track?.querySelector<HTMLElement>('[data-study-pin]');
      if (!active || !element || !track || !pin) {
        arrivalProgress.current = null;
        return;
      }
      const travel = Math.max(1, track.offsetHeight - pin.offsetHeight);
      const progress =
        (parseFloat(getComputedStyle(pin).top) - track.getBoundingClientRect().top) / travel;
      if (progress < 0.42) return;
      arrivalProgress.current = Math.min(1, progress);
      paintRequestPulse(element, 1, { catchUp: true });
    },
    [lane],
  );
  useScrollArrival(lane, !reducedMotion, landOnBatch, figure);

  const draw = useCallback(
    (_stage: HTMLElement, progress: number) => {
      const element = figure.current;
      if (!element) return;
      const previous = previousProgress.current;
      previousProgress.current = progress;
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
      if (
        progress >= 0.42 &&
        progress - previous > 0.38 &&
        performance.now() - lastScrollInput() < 750
      ) {
        arrivalProgress.current = progress;
        paintRequestPulse(element, 1, { catchUp: true });
        return;
      }
      paintRequestPulse(element, Math.max(0, Math.min(1, (progress - 0.035) / 0.685)));
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
      className="batching-spread batch-print"
      data-phase={phase}
      aria-label="Request batching comparison"
    >
      <div className="batch-graphic" aria-hidden="true">
        <span className="batch-fallback">{after ? '1' : '120'}</span>
        <RequestPulse onPaint={onPulsePaint} />
      </div>
      <figcaption className="batch-caption">
        <strong aria-hidden="true">
          {after ? 'API call.' : phase === 'batching' ? 'Batching.' : 'API calls.'}
        </strong>
        <p className={after ? 'batch-load-time' : undefined} aria-hidden="true">
          {after ? (
            <>
              <span>Page load</span> <b>60s → 2s</b>
            </>
          ) : phase === 'before' ? (
            'One mark per request.'
          ) : (
            ''
          )}
        </p>
        <span className="sr-only">
          120 separate API calls became one batched request. Page load went from about 60 seconds to
          2 seconds.
        </span>
      </figcaption>
      <div className="batch-folio">
        <a
          className="experience-case"
          href={evidenceHref(batchingStory, undefined)}
          onClick={(event) => open?.(event, batchingStory)}
        >
          How I batched the requests <ControlIcon name="arrow" />
        </a>
        <span className="batch-gesture" aria-hidden="true">
          Scroll to batch <ControlIcon name="arrow" />
        </span>
      </div>
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
