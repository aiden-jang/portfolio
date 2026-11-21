import { useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { ControlIcon } from './ControlIcon';
import './request-replay.css';

export function RequestReplay() {
  const [state, setState] = useState<'before' | 'running' | 'after'>('before');

  return (
    <figure className="request-replay" data-phase={state}>
      <div className="request-replay-labels">
        <span>120 separate requests</span>
        <span>1 batched request</span>
      </div>
      <div className="request-replay-rail" aria-hidden="true">
        <div
          className="request-replay-dots"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setState('after');
          }}
        >
          {Array.from({ length: 120 }, (_, index) => (
            <i key={index} style={{ '--offset': (index % 12) * 9 + 'ms' } as CSSProperties} />
          ))}
        </div>
        <ControlIcon name="arrow" />
        <div className="request-replay-result">
          <i />
        </div>
      </div>
      <figcaption>
        <span aria-live="polite">
          {state === 'after'
            ? 'One response carries the joined data.'
            : 'The page fetched each linked line item separately.'}
        </span>
        <button
          type="button"
          disabled={state === 'running'}
          onClick={() =>
            setState(prefersReducedMotion() ? (state === 'after' ? 'before' : 'after') : 'running')
          }
        >
          {state === 'after'
            ? prefersReducedMotion()
              ? 'Show before'
              : 'Replay'
            : 'Show batching'}
        </button>
      </figcaption>
    </figure>
  );
}
