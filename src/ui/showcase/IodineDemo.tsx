import { useEffect, useRef, useState } from 'react';
import recording from './media/iodine-demo.mp4?url';
import poster from './media/iodine-demo.webp?url';

export function IodineDemo() {
  const video = useRef<HTMLVideoElement>(null);
  const intention = useRef<boolean>();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      player.loop = !reduced.matches;
      if (visible && !document.hidden && (intention.current ?? !reduced.matches)) {
        void player.play().catch(() => {});
      } else {
        player.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.25;
        update();
      },
      { threshold: 0.25 },
    );
    observer.observe(player);
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
      player.pause();
    };
  }, []);

  return (
    <div className="iodine-demo">
      <video
        ref={video}
        src={recording}
        poster={poster}
        width={1440}
        height={684}
        preload="none"
        muted
        playsInline
        aria-label="Iodine screen recording"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          intention.current = false;
          setPlaying(false);
        }}
      />
      <button
        type="button"
        aria-label={playing ? 'Pause Iodine demo' : 'Play Iodine demo'}
        onClick={() => {
          const player = video.current;
          if (!player) return;
          intention.current = player.paused;
          if (player.paused) void player.play().catch(() => {});
          else player.pause();
        }}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          {playing ? (
            <path d="M7 5v10m6-10v10" stroke="currentColor" strokeWidth="2" />
          ) : (
            <path d="m7 4 9 6-9 6z" fill="currentColor" />
          )}
        </svg>
      </button>
    </div>
  );
}
