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
