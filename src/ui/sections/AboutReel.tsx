import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import './about-reel.css';

const media = {
  desktop: {
    poster: '/projects/about-reel/reel-desktop.jpg',
    video: '/projects/about-reel/reel-desktop.mp4',
  },
  phone: {
    poster: '/projects/about-reel/reel-phone.jpg',
    video: '/projects/about-reel/reel-phone.mp4',
  },
};
const phoneViewport = '(max-width: 700px)';
const labels = {
  ready: 'Play reel',
  loading: 'Loading reel',
  playing: 'Pause reel',
  paused: 'Resume reel',
  ended: 'Replay reel',
  error: 'Retry reel',
};

export function AboutReel() {
  const [phase, setPhase] = useState<keyof typeof labels>('ready');
  const [format, setFormat] = useState<'desktop' | 'phone'>();
  const video = useRef<HTMLVideoElement>(null);
  const pending = useRef(false);
  const [held, setHeld] = useState(false);
  const grip = useRef<number | null>(null);
  const resumeAfterHold = useRef(false);
  const recheck = useRef<() => void>();

  function hold(event: PointerEvent<HTMLButtonElement>) {
    const player = video.current;
    if (
      event.button !== 0 ||
      grip.current !== null ||
      !player ||
      player.paused ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    grip.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(true);
    player.pause();
  }

  function release(event: PointerEvent<HTMLButtonElement>) {
    if (grip.current !== event.pointerId) return;
    grip.current = null;
    setHeld(false);
    resumeAfterHold.current = true;
    recheck.current?.();
  }

  const play = useCallback(async (automatic = false) => {
    const player = video.current;
    if (!player || pending.current) return;
    pending.current = true;
    const next = matchMedia(phoneViewport).matches ? 'phone' : 'desktop';
    const source = new URL(media[next].video, location.href).href;
    if (player.src !== source || player.error) {
      player.src = source;
      setFormat(next);
    } else if (player.ended) {
      player.currentTime = 0;
    }
    setPhase('loading');
    try {
      await player.play();
      setPhase('playing');
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError' && !player.error;
      setPhase(automatic || aborted ? 'ready' : 'error');
    } finally {
      pending.current = false;
    }
  }, []);

  useEffect(() => {
    const player = video.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const size = matchMedia(phoneViewport);
    let visible = false;
    let attempted = false;
    let pausedOffscreen = false;

    function reconsider() {
      player.loop = !reduced.matches;
      if (!visible || document.hidden) {
        if (!player.paused && !player.ended) {
          pausedOffscreen = true;
          player.pause();
        }
        return;
      }

      if (reduced.matches || grip.current !== null) return;
      if (!attempted && !player.src) {
        attempted = true;
        void play(true);
      } else if ((pausedOffscreen || resumeAfterHold.current) && !player.ended) {
        resumeAfterHold.current = false;
        pausedOffscreen = false;
        void player.play().catch(() => {});
      }
    }

    function pauseWhileHidden() {
      if (!visible || document.hidden) reconsider();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio > 0;
        reconsider();
      },
      { threshold: Number.EPSILON },
    );
    function switchFormat() {
      if (!player.src) return;
      const next = size.matches ? 'phone' : 'desktop';
      const time = player.currentTime;
      const wasPlaying = !player.paused;
      player.addEventListener(
        'loadedmetadata',
        () => {
          player.currentTime = Math.min(time, Math.max(0, player.duration - 0.08));
          if (wasPlaying && visible && !document.hidden) void player.play().catch(() => {});
        },
        { once: true },
      );
      player.src = media[next].video;
      setFormat(next);
    }
    recheck.current = reconsider;
    observer.observe(player);
    size.addEventListener('change', switchFormat);
    reduced.addEventListener('change', reconsider);
    document.addEventListener('visibilitychange', reconsider);
    player.addEventListener('playing', pauseWhileHidden);
    reconsider();
    return () => {
      recheck.current = undefined;
      observer.disconnect();
      size.removeEventListener('change', switchFormat);
      reduced.removeEventListener('change', reconsider);
      document.removeEventListener('visibilitychange', reconsider);
      player.removeEventListener('playing', pauseWhileHidden);
    };
  }, [play]);

  return (
    <figure
      className="about-reel"
      aria-labelledby="about-reel-title"
      data-phase={phase}
      data-held={held || undefined}
    >
      <header className="sr-only">
        <h3 id="about-reel-title">Selected work in motion</h3>
      </header>
      <div className="about-reel-stage" data-format={format}>
        <video
          ref={video}
          aria-label="Selected work reel"
          preload="none"
          muted
          playsInline
          tabIndex={-1}
          onEnded={() => setPhase('ended')}
          onError={() => setPhase('error')}
        />
        {(phase === 'ready' || phase === 'loading' || phase === 'error') && (
          <picture className="about-reel-poster" aria-hidden="true">
            <source media={phoneViewport} srcSet={media.phone.poster} />
            <img src={media.desktop.poster} alt="" loading="lazy" decoding="async" />
          </picture>
        )}
        <button
          type="button"
          className="about-reel-play"
          aria-disabled={phase === 'loading' || undefined}
          onPointerDown={hold}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onContextMenu={(event) => {
            if (phase === 'playing') event.preventDefault();
          }}
          title={phase === 'playing' ? 'Hold to pause' : undefined}
          onClick={(event) => {
            if (phase === 'playing') {
              if (grip.current !== null) return;
              if (event.detail > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches)
                return;
              video.current?.pause();
              setPhase('paused');
            } else {
              void play();
            }
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {phase === 'playing' ? (
              <path d="M8 5v14m8-14v14" stroke="currentColor" strokeWidth="2" />
            ) : (
              <path d="m9 5 11 7-11 7z" fill="currentColor" />
            )}
          </svg>
          <span>{labels[phase]}</span>
        </button>
      </div>
    </figure>
  );
}
