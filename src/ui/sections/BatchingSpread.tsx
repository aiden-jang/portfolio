import { useCallback, useContext, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from '../../hooks/reducedMotion';
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
  const draw = useCallback(
    (_stage: HTMLElement, progress: number) => {
      const element = figure.current;
      if (!element) return;
      const value = reducedMotion ? 1 : Math.max(0, Math.min(1, (progress - 0.035) / 0.685));
      element.dataset.pulse = String(value);
      element.dispatchEvent(
        new CustomEvent('pulse-position', { detail: { value, instant: reducedMotion } }),
      );
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
        <div className="batch-end-time">
          <strong>2s</strong>
          <span>batched load</span>
        </div>
      </div>
      <figcaption className="batch-caption">
        <div className="batch-measure" aria-hidden="true">
          <strong>120 → 1</strong>
          <span>API requests</span>
        </div>
        <div className="batch-measure" aria-hidden="true">
          <strong>60s</strong>
          <span>Original load</span>
        </div>
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
