import { GLOBE_CUT_VIEWPORT_FRACTION } from '../config';
import { useAppStore } from '../store';
import { useEffect, useState } from 'react';

function opensAtIntro() {
  return (
    (!location.hash || location.hash === '#sec-intro') &&
    !new URLSearchParams(location.search).has('preview') &&
    !history.state?.portfolioCaseReturn
  );
}

export function useShowroomEntry(requested: boolean) {
  const [started, setStarted] = useState(opensAtIntro);
  useEffect(() => {
    if (started) return;
    if (requested) {
      setStarted(true);
      return;
    }
    const intro = document.getElementById('sec-intro');
    if (!intro) return;
    function check() {
      if (
        location.hash.startsWith('#work/') ||
        document.querySelector('[aria-modal="true"], dialog[open]')
      )
        return;
      const bounds = intro!.getBoundingClientRect();
      if (bounds.top < innerHeight && bounds.bottom > innerHeight * 0.12) setStarted(true);
    }
    // Section links restore their scroll position on the first layout frame.
    let observer: IntersectionObserver | undefined;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        observer = new IntersectionObserver(check, { rootMargin: '-12% 0px 0px' });
        observer.observe(intro);
        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('hashchange', check);
        check();
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('hashchange', check);
    };
  }, [requested, started]);
  return started || requested;
}

// Keep a loaded car for the return trip. A cold renderer can wait behind the opening still.
export function useOpeningRenderer(entered: boolean, required: boolean) {
  const [start, setStart] = useState(false);
  const warm = useAppStore((s) => Boolean(s.refs.carModel || s.carLoadError || s.sceneUnavailable));
  useEffect(() => {
    if (!entered || required || warm) return;
    const work = document.getElementById('sec-work');
    if (!work) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let timer = 0;
    const onCar = () =>
      work.getBoundingClientRect().top >
      innerHeight * (motion.matches ? 0.15 : GLOBE_CUT_VIEWPORT_FRACTION);
    function check() {
      clearTimeout(timer);
      if (!onCar()) setStart(false);
      else {
        timer = window.setTimeout(() => setStart(onCar()), 240);
      }
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    motion.addEventListener('change', check);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      motion.removeEventListener('change', check);
    };
  }, [entered, required, warm]);
  return entered && (required || warm || start);
}
