import { useEffect, useRef, useState } from 'react';
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
  const figure = useRef<HTMLElement>(null);
  const plots = useRef<HTMLDivElement>(null);
  const manual = useRef<{ scrollY: number; until: number } | null>(null);

  function show(next: typeof phase) {
    manual.current = {
      scrollY: window.scrollY,
      until: next === 'running' ? performance.now() + replayDuration : 0,
    };
    if (figure.current) figure.current.dataset.driver = 'controls';
    setPhase(next);
  }

  useEffect(() => {
    const element = figure.current;
    const panel = plots.current;
    if (!element || !panel) return;
    const measure = element.closest('.experience-lead')?.querySelector('.experience-measure');
    const navigation = document.querySelector('.portfolio-header');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const phone = matchMedia('(max-width: 700px)');
    let frame = 0;

    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      const panelTop = panel.getBoundingClientRect().top;
      const headerBottom = navigation?.getBoundingClientRect().bottom ?? 0;
      const metricVisible = (measure?.getBoundingClientRect().top ?? headerBottom) >= headerBottom;
      if (element.dataset.metricVisible !== String(metricVisible)) {
        element.dataset.metricVisible = String(metricVisible);
      }
      if (motion.matches) {
        delete element.dataset.driver;
        return;
      }
      const override = manual.current;
      if (override) {
        if (performance.now() < override.until) {
          override.scrollY = window.scrollY;
          return;
        }
        if (Math.abs(window.scrollY - override.scrollY) < 18) return;
        manual.current = null;
      }

      const start = height * (phone.matches ? 0.62 : 0.49);
      const finish = height * (phone.matches ? 0.34 : 0.17);
      const lane = element.closest<HTMLElement>('.batch-lane');
      const pin = lane?.firstElementChild as HTMLElement | null;
      const sticky = pin && getComputedStyle(pin).position === 'sticky';
      const progress =
        lane && pin && sticky
          ? Math.min(
              1,
              Math.max(
                0,
                (parseFloat(getComputedStyle(pin).top) - lane.getBoundingClientRect().top) /
                  Math.max(1, (lane.offsetHeight - pin.offsetHeight) * 0.64),
              ),
            )
          : Math.min(1, Math.max(0, (start - panelTop) / (start - finish)));
      const time = Math.round(progress * replayDuration);
      const next = progress >= 0.74 ? 'after' : 'before';
      const stage = progress === 0 ? 'start' : progress === 1 ? 'end' : 'middle';
      if (element.dataset.driver !== 'scroll') element.dataset.driver = 'scroll';
      if (element.dataset.scrollStage !== stage) element.dataset.scrollStage = stage;
      const scrollTime = time + 'ms';
      if (element.style.getPropertyValue('--batch-scroll-time') !== scrollTime) {
        element.style.setProperty('--batch-scroll-time', scrollTime);
      }
      if (element.dataset.phase !== next) setPhase(next);
    };

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);

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
      <div className="batching-controls">
        <span className="batching-scroll-metric" aria-hidden="true">
          60s → 2s
        </span>
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
      <div ref={plots} className="batching-plots">
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
