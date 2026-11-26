import { useGlobeCardPosition } from './useGlobeCardPosition';
import { GlobeControls, GlobeScreenshotButton } from './GlobeControls';
import { GlobeEventCard, type GlobeEvidence } from './GlobeEventCard';
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { GlobeArtwork } from './GlobeArtwork';
import { previewLink } from '../previewLinks';
import { setQuakeManual, useQuakeOpening } from './quakeProgress';
import { loadRecordedWeather } from './globe/recordedWeatherAssets';
import type { EvidenceFrame } from '../creative/evidenceNavigation';

type Engine = ReturnType<(typeof import('./globe-engine'))['createOrbitGlobe']>;
type GlobeProps = {
  frameRef?: Ref<{ capture: () => EvidenceFrame | undefined }>;
  image: string;
  caption: string;
  journey?: boolean;
  evidence?: GlobeEvidence;
  onCompare?: (trigger: HTMLButtonElement) => void;
};

export function InteractiveGlobe({
  image,
  caption,
  onCompare,
  journey,
  evidence,
  frameRef,
}: GlobeProps) {
  const figure = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    launch = useRef<HTMLButtonElement>(null),
    inspect = useRef<HTMLButtonElement>(null);
  const handle = useRef<Engine | null>(null),
    visible = useRef(false),
    mayAutoStart = useRef(true),
    requestedFocus = useRef(false);
  const capture = useCallback(() => handle.current?.capture(), []);
  useImperativeHandle(frameRef, () => ({ capture }), [capture]);
  const [mode, setMode] = useState<'auto' | 'manual' | null>(null),
    [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [approaching, setApproaching] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
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
    setQuakeManual(figure.current, false);
    setMode(null);
    setRotating(false);
    setSelected(null);
    setPhase('idle');
    requestAnimationFrame(() => launch.current?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(media.matches);
      if (media.matches) handle.current?.setRotating(false);
    };
    media.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = !!entry?.isIntersecting;
      handle.current?.sync();
    });
    observer.observe(figure.current!);
    const warm = new IntersectionObserver(
      ([entry]) => setApproaching(!!entry?.isIntersecting && !document.hidden),
      { rootMargin: '260px 0px' },
    );
    warm.observe(figure.current!);
    const sync = () => handle.current?.sync();
    const onVisibility = () => {
      sync();
      // Re-observe so a foreground tab can start when the figure was already in view.
      observer.disconnect();
      observer.observe(figure.current!);
      warm.disconnect();
      warm.observe(figure.current!);
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
      warm.disconnect();
      dialogs.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  useEffect(() => {
    if (
      mayAutoStart.current &&
      approaching &&
      !reduced &&
      !document.hidden &&
      (posterReady || posterUnavailable)
    ) {
      mayAutoStart.current = false;
      setMode('auto');
    }
  }, [approaching, posterReady, posterUnavailable, reduced]);
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
        setQuakeManual(figure.current, false);
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
      fetch('/projects/atlas-events.json', {
        signal: abort.signal,
      }).then((response) => {
        if (!response.ok) throw Error('Snapshot unavailable');
        return response.json();
      }),
      loadRecordedWeather(abort.signal).catch(() => undefined),
    ])
      .then(([{ engine, geography, aurora }, snapshot, weather]) => {
        if (disposed) {
          weather?.radar.close();
          return;
        }
        handle.current = engine.createOrbitGlobe(target, snapshot, geography, aurora, {
          weather,
          autoRotate: mode === 'auto',
          onManual: journey ? () => setQuakeManual(target, true) : undefined,
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
        const date = new Date(snapshot.metadata.generated);
        setCaptured(date.toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' }));
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
  }, [mode, journey]);
  const ready = !!mode && phase === 'ready';
  useQuakeOpening(figure, !!journey && mode === 'auto' && !reduced, ready);
  useGlobeCardPosition(figure, ready && !!selected);
  useEffect(() => {
    if (ready && requestedFocus.current) {
      requestedFocus.current = false;
      canvas.current?.focus({ preventScroll: true });
    }
  }, [ready]);
  return (
    <>
      <figure
        ref={figure}
        className="orbit-feature"
        data-globe-phase={phase}
        data-has-event={ready && !!selected}
      >
        <div className="project-preview orbit-preview" data-project="everythingisfine" data-atlas>
          <GlobeArtwork
            image={image}
            fallback={posterUnavailable}
            canvas={canvas}
            started={!!mode}
            loading={phase === 'loading'}
            ready={ready}
            journey={journey}
            onPosterReady={onPosterReady}
            onPosterUnavailable={onPosterUnavailable}
            onScreenshotUnavailable={() => setScreenshotUnavailable(true)}
          />
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
                  if (journey) setQuakeManual(figure.current, true);
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
                onRotate={() => handle.current?.toggleRotation()}
                eventSelected={!!selected}
                onShow={() => handle.current?.[selected ? 'showEvent' : 'showFeatured']()}
                onReset={() => handle.current?.reset()}
                onDone={() => exitRef.current()}
              />
            )}
            <GlobeScreenshotButton
              buttonRef={inspect}
              unavailable={screenshotUnavailable}
              onInspect={() => setViewer(true)}
            />
          </div>
          {ready && selected && (
            <GlobeEventCard
              event={selected}
              evidence={
                selected.id === 'usd0015edq' && evidence
                  ? {
                      ...evidence,
                      openEvidence: (event, id) =>
                        evidence.openEvidence?.(event, id, capture) ?? false,
                    }
                  : undefined
              }
              onCompare={selected.id === 'usd0015edq' ? onCompare : undefined}
              onClose={() => {
                handle.current?.clearSelection();
                show.current?.focus({ preventScroll: true });
              }}
            />
          )}
        </div>
        <figcaption aria-live="polite" className={phase === 'error' ? 'orbit-fallback' : 'sr-only'}>
          {phase === 'error'
            ? 'The globe could not start. Retry it, view the screenshot, or open Compare agency reports.'
            : ready
              ? `Drag to rotate and select a marker. Recorded USGS earthquakes${captured ? ' · ' + captured + ' UTC' : ''}, NOAA wind and aurora, and RainViewer radar.`
              : phase === 'loading'
                ? 'Preparing globe…'
                : 'Recorded Kamchatka earthquake. Explore the globe to browse more recorded events.'}
        </figcaption>
      </figure>
      {viewer && (
        <ScreenshotViewer
          image={image}
          name="meanwhile."
          caption={caption}
          returnFocus={inspect.current}
          onClose={() => setViewer(false)}
          viewLink={previewLink(location.href, 'everythingisfine', 0)}
        />
      )}
    </>
  );
}
