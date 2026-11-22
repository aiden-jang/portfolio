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
    const study = document.querySelector('.about-framing-image');
    const headerHeight =
      document.querySelector('.portfolio-header')?.getBoundingClientRect().height ?? 0;
    let timer = 0;
    let visible = false;
    let studyVisible = false;
    let attempted = false;
    let pausedOffscreen = false;

    function reconsider() {
      clearTimeout(timer);
      player.loop = !reduced.matches;
      const canWatch = visible && !studyVisible && !document.hidden;
      if (!canWatch) {
        if (!player.paused && !player.ended) {
          pausedOffscreen = true;
          player.pause();
        }
        return;
      }

      if (reduced.matches) return;
      timer = window.setTimeout(() => {
        if (!attempted && !player.src) {
          attempted = true;
          void play(true);
        } else if (pausedOffscreen && !player.ended) {
          pausedOffscreen = false;
          void player.play().catch(() => {});
        }
      }, 280);
    }

    function pauseWhileHidden() {
      if (!visible || studyVisible || document.hidden) reconsider();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.55;
        reconsider();
      },
      { threshold: 0.55, rootMargin: `-${Math.round(headerHeight)}px 0px 0px` },
    );
    const studyObserver = new IntersectionObserver(
      ([entry]) => {
        studyVisible = entry.intersectionRatio >= 0.5;
        reconsider();
      },
      { threshold: 0.5, rootMargin: '0px 0px -35% 0px' },
    );
    observer.observe(player);
    if (study) studyObserver.observe(study);
    reduced.addEventListener('change', reconsider);
    document.addEventListener('visibilitychange', reconsider);
    player.addEventListener('playing', pauseWhileHidden);
    reconsider();
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      studyObserver.disconnect();
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
        <span>0:12</span>
      </header>
      <div className="about-reel-stage" data-format={format}>
        <video
          ref={video}
          aria-label="Twelve-second selected work reel"
          aria-describedby="about-reel-caption"
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
      <figcaption id="about-reel-caption">
        The Ferrari F40 in Studio, Kamchatka on the globe, a file restored in Iodine, and a flower
        opened in bloomnote. Silent film.
      </figcaption>
    </figure>
  );
}
