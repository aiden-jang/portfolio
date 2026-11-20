import { useEffect, useRef, useSyncExternalStore } from 'react';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { useAppStore } from '../store';
import { SCENE_ACTIVITY_EVENT } from '../three/useSceneActivity';
import { ControlIcon } from '../ui/ControlIcon';
import { useDialogFocus } from '../ui/useDialogFocus';
import { usePageScrollLock } from '../ui/usePageScrollLock';
import { useLineup } from './state';
import { useLineupGesture } from './useLineupGesture';
import { F40, F40_LENGTH, RB16B } from './vehicles';
import './lineup.css';

function subscribeMotion(notify: () => void) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}

export function Lineup() {
  const close = useLineup((state) => state.close);
  const status = useLineup((state) => state.status);
  const view = useLineup((state) => state.view);
  const playing = useLineup((state) => state.playing);
  const length = useLineup((state) => state.length);
  const choose = useLineup((state) => state.choose);
  const toggleOrbit = useLineup((state) => state.toggleOrbit);
  const retry = useLineup((state) => state.retry);
  const dialog = useRef<HTMLElement>(null);
  const exit = useRef<HTMLButtonElement>(null);
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const { dragging, events } = useLineupGesture();
  usePageScrollLock(true);
  useDialogFocus(true, dialog, exit);

  useEffect(() => {
    window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT));
    const unsubscribe = useAppStore.subscribe(
      ({ sceneUnavailable, isContactVisible, sectionIndex }) => {
        if (sceneUnavailable || isContactVisible || sectionIndex !== 0) close();
      },
    );
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    };
    window.addEventListener('keydown', escape, true);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', escape, true);
      window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT));
      queueMicrotask(() =>
        Array.from(document.querySelectorAll<HTMLButtonElement>('.all-controls-trigger'))
          .find((button) => button.getClientRects().length)
          ?.focus({ preventScroll: true }),
      );
    };
  }, [close]);

  return (
    <section
      ref={dialog}
      className="garage-lineup"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lineup-title"
      data-live-scene
    >
      <div
        {...events}
        className="lineup-stage"
        role="region"
        aria-label="Orbit both cars"
        aria-describedby="lineup-gesture"
        tabIndex={status === 'ready' ? 0 : -1}
        data-dragging={dragging}
      />
      <div className="lineup-heading">
        <h2 id="lineup-title">Lineup</h2>
        <p>Ferrari F40 &amp; Red Bull RB16B</p>
      </div>
      <button ref={exit} type="button" className="lineup-exit" onClick={close}>
        <ControlIcon name="arrow" />
        Back to Garage
      </button>
      {status !== 'ready' && (
        <div className="lineup-loading">
          <p role="status">
            {status === 'failed' ? 'The lineup couldn’t load.' : 'Bringing both cars into Studio…'}
          </p>
          {status === 'failed' && (
            <button type="button" onClick={retry}>
              Retry
            </button>
          )}
        </div>
      )}
      <div className="lineup-footer">
        <p className="lineup-gesture" id="lineup-gesture">
          {dragging || playing ? 'Orbiting both cars' : 'Drag to orbit both cars'}
          <span className="sr-only">
            {' '}
            Use the left and right arrow keys to orbit with a keyboard.
          </span>
        </p>
        <div className="lineup-dock">
          <dl className="lineup-specs">
            <div>
              <dt>{F40.name}</dt>
              <dd>{F40_LENGTH.toFixed(2)} m long</dd>
            </div>
            <div>
              <dt>{RB16B.name}</dt>
              <dd>{length ? `≈ ${length.toFixed(2)} m long` : '2021 Formula 1'}</dd>
            </div>
          </dl>
          <div className="lineup-controls" role="group" aria-label="Lineup camera">
            <button
              type="button"
              disabled={status !== 'ready'}
              aria-pressed={view === 'opening'}
              onClick={() => choose('opening')}
            >
              Opening
            </button>
            <button
              type="button"
              disabled={status !== 'ready'}
              aria-pressed={view === 'side'}
              onClick={() => choose('side')}
            >
              Side view
            </button>
            <button type="button" disabled={status !== 'ready'} onClick={toggleOrbit}>
              <ControlIcon name={playing ? 'pause' : 'play'} />
              {playing ? 'Pause' : reduced ? 'Step orbit' : 'Play orbit'}
            </button>
          </div>
        </div>
        <LineupCredits />
      </div>
    </section>
  );
}

function LineupCredits() {
  const ferrari = F40.credit;
  const redBull = RB16B.credit;
  return (
    <details className="lineup-credits">
      <summary>Scale and model credits</summary>
      <div>
        <p>
          The F40 uses its{' '}
          <a href="https://opendata.astra.admin.ch/ivzod/2000-Typengenehmigungen_TG_TARGA/2310-pdf-Drucke_TG_1985-1995/2312-deutsch/1F1017_D.pdf">
            documented length
          </a>
          . The RB16B’s length is estimated from the model’s front tires and the{' '}
          <a href="https://press.pirelli.com/pirelli-presents-new-wider-2017-formula-1-tyres/">
            period Pirelli slick diameter
          </a>
          .
        </p>
        {ferrari && redBull && (
          <p>
            <a href={ferrari.url}>F40 by {ferrari.author}</a>
            {' · '}
            <a href={redBull.url}>RB16B by {redBull.author}</a>
            {' · '}
            <a href={ferrari.licenseUrl}>{ferrari.license}</a>
          </p>
        )}
      </div>
    </details>
  );
}
