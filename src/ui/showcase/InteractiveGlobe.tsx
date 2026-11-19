import { GlobeControls } from './GlobeControls';
import { GlobeEventCard } from './GlobeEventCard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { ScreenshotImage } from '../ScreenshotImage';
import { previewLink } from '../previewLinks';

type Engine = ReturnType<(typeof import('./globe-engine'))['createOrbitGlobe']>;
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const START_THRESHOLD = 0.12;

export function InteractiveGlobe({ image, caption }: { image: string; caption: string }) {
  const figure = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    launch = useRef<HTMLButtonElement>(null),
    inspect = useRef<HTMLButtonElement>(null);
  const handle = useRef<Engine | null>(null),
    visible = useRef(false),
    mayAutoStart = useRef(true),
    requestedFocus = useRef(false);
  const [mode, setMode] = useState<'auto' | 'manual' | null>(null),
    [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia(MOTION_QUERY).matches);
  const [rotating, setRotating] = useState(false);
  const [selected, setSelected] = useState<import('./globe-engine').PickedEvent | null>(null);
  const show = useRef<HTMLButtonElement>(null);
  const [posterReady, setPosterReady] = useState(false);
  const [posterUnavailable, setPosterUnavailable] = useState(false);
  const onPosterReady = useCallback(() => setPosterReady(true), []);
  const onPosterUnavailable = useCallback(() => setPosterUnavailable(true), []);
  const [screenshotUnavailable, setScreenshotUnavailable] = useState(false);
  const [viewer, setViewer] = useState(false),
    [captured, setCaptured] = useState('');
  const exitRef = useRef<() => void>(() => {});
  exitRef.current = () => {
    setMode(null);
    setRotating(false);
    setSelected(null);
    setPhase('idle');
    requestAnimationFrame(() => launch.current?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    const media = matchMedia(MOTION_QUERY);
    const update = () => {
      setReduced(media.matches);
      if (media.matches) handle.current?.setRotating(false);
    };
    media.addEventListener('change', update);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = !!entry?.isIntersecting;
        setInView(
          visible.current && entry!.intersectionRatio >= START_THRESHOLD && !document.hidden,
        );
        handle.current?.sync();
      },
      { threshold: [0, START_THRESHOLD] },
    );
    observer.observe(figure.current!);
    const sync = () => handle.current?.sync();
    const onVisibility = () => {
      sync();
      // Re-observe so a foreground tab can start when the figure was already in view.
      observer.disconnect();
      observer.observe(figure.current!);
    };
    document.addEventListener('visibilitychange', onVisibility);
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
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  useEffect(() => {
    if (
      mayAutoStart.current &&
      inView &&
      !reduced &&
      !document.hidden &&
      (posterReady || posterUnavailable)
    ) {
      mayAutoStart.current = false;
      setMode('auto');
    }
  }, [inView, posterReady, posterUnavailable, reduced]);
  useEffect(() => {
    if (!mode || !canvas.current) return;
    const target = canvas.current;
    let disposed = false;
    const abort = new AbortController();
    setPhase('loading');
    const failed = () => {
      if (!disposed) {
        const restoreFocus =
          requestedFocus.current || !!figure.current?.contains(document.activeElement);
        requestedFocus.current = false;
        setPhase('error');
        setMode(null);
        setRotating(false);
        if (restoreFocus)
          requestAnimationFrame(() => launch.current?.focus({ preventScroll: true }));
      }
    };
    Promise.all([
      import('./globe-engine').then(async (engine) => {
        const [geography, aurora] = await Promise.all([
          engine.loadGeography(abort.signal),
          engine.loadAurora(abort.signal),
        ]);
        return { engine, geography, aurora };
      }),
      fetch('/projects/orbit-snapshot.json', { signal: abort.signal }).then((response) => {
        if (!response.ok) throw Error('Snapshot unavailable');
        return response.json();
      }),
    ])
      .then(([{ engine, geography, aurora }, snapshot]) => {
        if (disposed) return;
        handle.current = engine.createOrbitGlobe(target, snapshot, geography, aurora, {
          autoRotate: mode === 'auto',
          onRotation: setRotating,
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
  }, [mode]);
  const ready = !!mode && phase === 'ready';
  useEffect(() => {
    if (ready && requestedFocus.current) {
      requestedFocus.current = false;
      canvas.current?.focus({ preventScroll: true });
    }
  }, [ready]);
  return (
    <>
      <figure ref={figure} className="orbit-feature" data-globe-phase={phase}>
        <div className="project-preview orbit-preview" data-project="everythingisfine">
          <div className="preview-thumbnail">
            <div className="orbit-art" data-poster={!posterUnavailable}>
              {posterUnavailable ? (
                <ScreenshotImage
                  src={image}
                  alt="everythingisfine product interface"
                  lazy
                  onUnavailable={() => setScreenshotUnavailable(true)}
                />
              ) : (
                <ScreenshotImage
                  src="/projects/globe-opening-desktop.webp"
                  narrowSrc="/projects/globe-opening-mobile.webp"
                  alt="Globe centered on the North Pacific, with the Kamchatka earthquake marked"
                  lazy
                  onReady={onPosterReady}
                  onUnavailable={onPosterUnavailable}
                />
              )}
              {mode && (
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
          </div>
          <div className="orbit-actions">
            {!ready && (
              <button
                ref={launch}
                type="button"
                className="orbit-launch"
                disabled={phase === 'loading'}
                onClick={() => {
                  mayAutoStart.current = false;
                  requestedFocus.current = true;
                  setMode('manual');
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
              <GlobeControls
                reduced={reduced}
                rotating={rotating}
                showRef={show}
                onRotate={() => handle.current?.setRotating(!rotating)}
                onShow={() => handle.current?.showEvent()}
                onReset={() => handle.current?.reset()}
                onDone={() => exitRef.current()}
              />
            )}
            <button
              ref={inspect}
              type="button"
              className="orbit-screenshot"
              disabled={screenshotUnavailable}
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
        <figcaption aria-live="polite" className="sr-only">
          {phase === 'error'
            ? 'The globe could not start. You can retry, view the screenshot or open the app.'
            : ready
              ? `Drag to rotate and select a marker for details. Recorded USGS events${captured ? ' · ' + captured + ' UTC' : ''}, with a recorded NOAA aurora.`
              : phase === 'loading'
                ? 'Preparing globe…'
                : 'Recorded Kamchatka earthquake. Explore the globe to browse more recorded events.'}
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
