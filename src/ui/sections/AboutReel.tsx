import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  playing: 'Play reel',
  ended: 'Replay reel',
  error: 'Retry reel',
};

export function AboutReel() {
  const [phase, setPhase] = useState<keyof typeof labels>('ready');
  const [format, setFormat] = useState<'desktop' | 'phone'>();
  const video = useRef<HTMLVideoElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const ownsFocus = useRef(false);

  const pending = useRef(false);

  const play = useCallback(async (automatic = false) => {
    const player = video.current;
    if (!player || pending.current) return;
    pending.current = true;
    ownsFocus.current = !automatic && document.activeElement === button.current;
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

      if (reduced.matches) return;
      if (!attempted && !player.src) {
        attempted = true;
        void play(true);
      } else if (pausedOffscreen && !player.ended) {
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
    observer.observe(player);
    reduced.addEventListener('change', reconsider);
    document.addEventListener('visibilitychange', reconsider);
    player.addEventListener('playing', pauseWhileHidden);
    reconsider();
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', reconsider);
      document.removeEventListener('visibilitychange', reconsider);
      player.removeEventListener('playing', pauseWhileHidden);
    };
  }, [play]);

  useLayoutEffect(() => {
    if (!ownsFocus.current) return;
    const active = document.activeElement;
    if (phase === 'playing' && (active === button.current || active === document.body)) {
      video.current?.focus({ preventScroll: true });
    }
    if (
      (phase === 'ended' || phase === 'error') &&
      (active === video.current || active === document.body)
    ) {
      button.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  return (
    <figure className="about-reel" aria-labelledby="about-reel-title" data-phase={phase}>
      <header className="about-reel-heading">
        <h3 id="about-reel-title">Selected work in motion</h3>
      </header>
      <div className="about-reel-stage" data-format={format}>
        <video
          ref={video}
          aria-label="Selected work reel"
          preload="none"
          muted
          playsInline
          controls={phase === 'playing'}
          tabIndex={phase === 'playing' ? 0 : -1}
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
          ref={button}
          type="button"
          className="about-reel-play"
          hidden={phase === 'playing'}
          aria-disabled={phase === 'loading' || undefined}
          onClick={() => void play()}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 5 11 7-11 7z" fill="currentColor" />
          </svg>
          <span>{labels[phase]}</span>
        </button>
      </div>
    </figure>
  );
}
