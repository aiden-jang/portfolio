import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { loadOpeningGlobe } from './loadOpeningGlobe';
import './original-globe-opening.css';
import './featured-globe-cut.css';

export function OriginalGlobeOpening() {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = frame.current!;
    const earth = canvas.current!;
    const view = earth.parentElement!;
    const work = document.getElementById('sec-work');
    if (!work) return;
    const section = work;

    const abort = new AbortController();
    const motion = matchMedia('(prefers-reduced-motion: no-preference)');
    let globe: Awaited<ReturnType<typeof loadOpeningGlobe>>;
    let pending = 0;
    let last = 0;
    let orbitTime = 0;

    function schedule() {
      if (!pending) pending = requestAnimationFrame(paint);
    }

    function paint(now: number) {
      pending = 0;
      const viewport = innerHeight;
      const offset =
        Number.parseFloat(document.documentElement.style.getPropertyValue('--globe-cut-offset')) ||
        0;
      const top = section.getBoundingClientRect().top - offset;
      const active =
        motion.matches &&
        !document.hidden &&
        !!globe &&
        top <= viewport * 0.93 &&
        top > viewport * 0.19 &&
        !location.hash.startsWith('#quake/') &&
        !document.body.matches('.modal-open, [data-photo-mode=true]') &&
        !section.closest('[inert]');
      stage.hidden = !active;
      if (!active || !globe) {
        last = 0;
        return;
      }

      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const mobile = width < 700;
      const viewWidth = view.clientWidth;
      const viewHeight = view.clientHeight;
      if (last) orbitTime += Math.min(0.08, (now - last) / 1000);
      last = now;
      const fit = 1 / (0.86 * Math.tan((16 * Math.PI) / 180)) / Math.min(1, viewWidth / viewHeight);
      const distance = mobile ? (3.6 * height) / width : 3.12;

      globe.resize();
      globe.render(
        {
          lon: 143 + Math.sin(orbitTime * 0.065) * 10,
          lat: 31,
          zoom: fit / distance,
        },
        0,
        now / 1000,
        now / 1000,
      );
      view.style.translate = `${width * (mobile ? 0.14 : 0.35)}px ${height * (mobile ? 0.17 : 0.12)}px`;
      schedule();
    }

    function syncMotion() {
      schedule();
      if (!motion.matches || globe || loading) return;
      loading = true;
      void import('./loadOpeningGlobe')
        .then(({ loadOpeningGlobe }) => loadOpeningGlobe(earth, abort.signal))
        .then((value) => {
          if (abort.signal.aborted) {
            value?.dispose();
            return;
          }
          globe = value;
          schedule();
        })
        .catch(() => {})
        .finally(() => {
          loading = false;
        });
    }
    let loading = false;
    syncMotion();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', syncMotion);
    return () => {
      abort.abort();
      globe?.dispose();
      cancelAnimationFrame(pending);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      motion.removeEventListener('change', syncMotion);
    };
  }, []);

  return createPortal(
    <div className="original-globe-opening" ref={frame} aria-hidden="true" hidden>
      <span>meanwhile.</span>
      <div>
        <canvas ref={canvas} data-cinema />
      </div>
    </div>,
    document.body,
  );
}
