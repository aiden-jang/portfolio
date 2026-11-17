import { GlobeEventCard } from './GlobeEventCard';
import { useEffect, useRef, useState } from 'react';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { ScreenshotImage } from '../ScreenshotImage';
import { previewLink } from '../previewLinks';

type Engine = ReturnType<(typeof import('./globe-engine'))['createOrbitGlobe']>;
export function InteractiveGlobe({ image, caption }: { image: string; caption: string }) {
  const figure = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    launch = useRef<HTMLButtonElement>(null),
    inspect = useRef<HTMLButtonElement>(null);
  const handle = useRef<Engine | null>(null),
    visible = useRef(false),
    stopped = useRef(false),
    requestedFocus = useRef(false);
  const [active, setActive] = useState(false),
    [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [mobile, setMobile] = useState(
    () => matchMedia('(max-width: 767px), (pointer: coarse)').matches,
  );
  const [selected, setSelected] = useState<import('./globe-engine').PickedEvent | null>(null);
  const show = useRef<HTMLButtonElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [viewer, setViewer] = useState(false),
    [captured, setCaptured] = useState('');
  const exitRef = useRef<() => void>(() => {});
  exitRef.current = () => {
    stopped.current = true;
    setActive(false);
    setSelected(null);
    setPhase('idle');
    requestAnimationFrame(() => launch.current?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    const media = matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => {
      setMobile(media.matches);
      stopped.current = false;
      setActive(!media.matches && visible.current);
      setPhase('idle');
    };
    media.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry!.isIntersecting;
      if (visible.current && !media.matches && !stopped.current) setActive(true);
      handle.current?.sync();
    });
    observer.observe(figure.current!);
    const sync = () => handle.current?.sync();
    document.addEventListener('visibilitychange', sync);
    const dialogs = new MutationObserver(sync);
    dialogs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open', 'aria-modal', 'aria-hidden'],
    });
    return () => {
      media.removeEventListener('change', update);
      observer.disconnect();
      dialogs.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  useEffect(() => {
    if (!active || !canvas.current) return;
    const target = canvas.current;
    let disposed = false;
    const abort = new AbortController();
    setPhase('loading');
    const failed = () => {
      if (!disposed) {
        stopped.current = true;
        setPhase('error');
        setActive(false);
        requestAnimationFrame(() => launch.current?.focus({ preventScroll: true }));
      }
    };
    Promise.all([
      import('./globe-engine').then(async (engine) => ({
        engine,
        geography: await engine.loadGeography(abort.signal),
      })),
      fetch('/projects/orbit-snapshot.json', { signal: abort.signal }).then((response) => {
        if (!response.ok) throw Error('Snapshot unavailable');
        return response.json();
      }),
    ])
      .then(([{ engine, geography }, snapshot]) => {
        if (disposed) return;
        handle.current = engine.createOrbitGlobe(target, snapshot, geography, {
          paused: () =>
            !visible.current ||
            document.hidden ||
            !!document.querySelector(
              'dialog[open], [role="dialog"][aria-modal="true"]:not([aria-hidden="true"])',
            ),
          failed,
          select: setSelected,
          exit: () => exitRef.current(),
        });
        setCaptured(
          new Date(snapshot.metadata.generated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          }),
        );
        setPhase('ready');
        if (requestedFocus.current) {
          requestedFocus.current = false;
          target.focus({ preventScroll: true });
        }
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') failed();
      });
    return () => {
      disposed = true;
      abort.abort();
      handle.current?.dispose();
      handle.current = null;
    };
  }, [active]);
  const ready = active && phase === 'ready';
  return (
    <>
      <figure ref={figure} className="orbit-feature" data-globe-phase={phase}>
        <div className="project-preview orbit-preview" data-project="everythingisfine">
          <div className="preview-thumbnail">
            <ScreenshotImage
              src={image}
              alt="everythingisfine product interface"
              lazy
              onUnavailable={() => setUnavailable(true)}
            />
            {active && (
              <div className="orbit-viewport" aria-busy={phase === 'loading'}>
                <canvas
                  ref={canvas}
                  id="globe-view"
                  tabIndex={ready ? 0 : -1}
                  role="img"
                  aria-label="Interactive globe. Drag or use arrow keys to rotate. Press zero to reset, Escape to finish."
                />
              </div>
            )}
          </div>
          <div className="orbit-actions">
            {!ready && (
              <button
                ref={launch}
                type="button"
                className="orbit-launch"
                disabled={phase === 'loading'}
                onClick={() => {
                  stopped.current = false;
                  requestedFocus.current = true;
                  setActive(true);
                }}
              >
                {phase === 'loading'
                  ? 'Preparing globe…'
                  : phase === 'error'
                    ? 'Retry globe'
                    : 'Explore globe'}
              </button>
            )}
            {ready && (
              <>
                <button
                  ref={show}
                  type="button"
                  className="orbit-event-trigger"
                  aria-label="Show an event"
                  title="Show an event"
                  onClick={() => handle.current?.showEvent()}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="7" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handle.current?.reset();
                    setSelected(null);
                  }}
                >
                  Reset globe
                </button>
                <button type="button" onClick={() => exitRef.current()}>
                  Done
                </button>
              </>
            )}
            <button
              ref={inspect}
              type="button"
              className="orbit-screenshot"
              disabled={unavailable}
              aria-label="Inspect screenshot: everythingisfine"
              title="View full screenshot"
              onClick={() => setViewer(true)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" />
              </svg>
            </button>
          </div>
          {ready && selected && (
            <GlobeEventCard
              event={selected}
              onClose={() => {
                setSelected(null);
                show.current?.focus({ preventScroll: true });
              }}
            />
          )}
        </div>
        <figcaption aria-live="polite">
          {phase === 'error'
            ? 'The globe could not start. You can retry, view the screenshot or open the app.'
            : ready
              ? `${mobile ? 'Drag to rotate; tap a marker for details. Done returns to scrolling.' : 'Drag to rotate; select a marker for details.'} Recorded USGS events${captured ? ' · ' + captured + ' UTC' : ''}.`
              : 'Explore the globe here, or open the full app for live layers.'}
        </figcaption>
      </figure>
      {viewer && (
        <ScreenshotViewer
          image={image}
          name="everythingisfine"
          caption={caption}
          returnFocus={inspect.current}
          onClose={() => setViewer(false)}
          viewLink={previewLink(location.href, 'everythingisfine', 0)}
        />
      )}
    </>
  );
}
