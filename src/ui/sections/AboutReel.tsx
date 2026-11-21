import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    const player = video.current!;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) player.pause();
    });
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

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

  async function play() {
    if (phase === 'loading') return;
    const player = video.current!;
    ownsFocus.current = document.activeElement === button.current;
    const next = matchMedia(phoneViewport).matches ? 'phone' : 'desktop';
    if (format !== next || phase === 'error') {
      player.src = media[next].video;
      setFormat(next);
    } else if (player.ended) {
      player.currentTime = 0;
    }
    setPhase('loading');
    try {
      await player.play();
      setPhase('playing');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError' && !player.error) {
        setPhase('ready');
      } else {
        setPhase('error');
      }
    }
  }

  return (
    <figure className="about-reel" aria-labelledby="about-reel-title">
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
        Ferrari F40 in Studio, Kamchatka on the globe, a file restored in Iodine, and a flower
        opened in bloomnote. Silent film.
      </figcaption>
    </figure>
  );
}
