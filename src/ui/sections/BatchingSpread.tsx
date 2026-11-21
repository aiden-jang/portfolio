import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../hooks/reducedMotion';
import { ControlIcon } from '../ControlIcon';
import './batching-spread.css';

const replayDuration = 960;
const marks = Array.from({ length: 120 }, (_, index) => ({
  x: 12 + (index % 12) * 27,
  y: 12 + Math.floor(index / 12) * 13,
}));

export function BatchingSpread() {
  const [phase, setPhase] = useState<'before' | 'running' | 'after'>('before');
  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setTimeout(() => setPhase('after'), replayDuration);
    return () => window.clearTimeout(timer);
  }, [phase]);
  const after = phase === 'after';

  return (
    <figure className="batching-spread" data-phase={phase} aria-label="Request batching comparison">
      <div className="batching-controls">
        <div className="batching-states" role="group" aria-label="Compare request patterns">
          <button type="button" aria-pressed={!after} onClick={() => setPhase('before')}>
            Before
          </button>
          <button type="button" aria-pressed={after} onClick={() => setPhase('after')}>
            After
          </button>
        </div>
        <button
          type="button"
          className="batching-play"
          aria-disabled={phase === 'running'}
          onClick={() => {
            if (phase !== 'running') setPhase(prefersReducedMotion() ? 'after' : 'running');
          }}
        >
          <ControlIcon name="play" />
          {phase === 'running' ? 'Batching…' : 'Replay batching'}
        </button>
      </div>
      <div className="batching-plots">
        <div className="batching-plot batching-before">
          <h4>120 separate requests</h4>
          <div className="batching-graphic">
            <svg viewBox="0 0 337 141" aria-hidden="true">
              <g className="batching-marks">
                {marks.map(({ x, y }) => (
                  <rect key={`${x},${y}`} x={x} y={y} width="16" height="5" rx="1.5" />
                ))}
              </g>
            </svg>
          </div>
          <p>One fetch per linked line item</p>
        </div>
        <div className="batching-plot batching-after">
          <h4>1 batched request</h4>
          <div className="batching-graphic">
            <svg viewBox="0 0 337 141" aria-hidden="true">
              <g className="batching-packet">
                <rect x="101" y="53" width="135" height="35" rx="4" fill="none" />
                <path d="M121 70.5h95" />
              </g>
            </svg>
          </div>
          <p>One response with the joined data</p>
        </div>
        <div className="batching-gate" aria-hidden="true">
          <ControlIcon name="arrow" />
        </div>
        <span className="batching-flight" aria-hidden="true" />
      </div>
      <figcaption>
        <span className="sr-only" aria-live="polite">
          {after
            ? 'After batching: one API call and two seconds to load.'
            : 'Before batching: 120 API calls and about 60 seconds to load.'}
        </span>
      </figcaption>
    </figure>
  );
}
