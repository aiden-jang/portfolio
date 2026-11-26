import { useLayoutEffect, type RefObject } from 'react';
import { clamp } from '../../math';
import {
  finishStudyFrame,
  finishStudyMotion,
  finishStudyProgress,
  useFinishStudy,
} from '../../three/finishStudy';
import './finish-study-match.css';

export function useFinishStudyMatch(track: RefObject<HTMLDivElement>, liveReady: boolean) {
  useLayoutEffect(() => {
    const film = track.current;
    const stage = film?.firstElementChild as HTMLElement | undefined;
    const about = film?.closest<HTMLElement>('#sec-about');
    if (!film || !stage || !about) return;

    const motion = matchMedia(finishStudyMotion);
    let frame = 0;
    function show(active: boolean) {
      document.body.toggleAttribute('data-study-match', active);
      if (useFinishStudy.getState().active !== active) useFinishStudy.setState({ active });
    }

    const update = () => {
      frame = 0;
      const contact = document.getElementById('sec-contact');
      if (!contact) return;
      const bounds = film.getBoundingClientRect();
      const contactTop = contact.getBoundingClientRect().top;
      // A fragment jump can leave the aligned section a fraction of a CSS pixel below the top.
      const inStudy = motion.matches && bounds.top < innerHeight && contactTop > 1;
      const progress = finishStudyProgress(bounds.top, bounds.height - stage.offsetHeight);
      const active = inStudy && liveReady;
      const poster =
        inStudy && !liveReady && progress >= 0.995
          ? contact.querySelector<HTMLImageElement>('.contact-poster img')
          : null;
      const usePoster = Boolean(poster?.complete && poster.naturalWidth);
      const matching = active || usePoster;
      if (matching) {
        finishStudyFrame.top = Math.max(0, bounds.top);
        finishStudyFrame.progress = progress;
        about.style.setProperty(
          '--study-start',
          bounds.top - about.getBoundingClientRect().top + 'px',
        );
        if (contactTop < innerHeight - 12) {
          const reveal = clamp((innerHeight * 0.17 - contactTop) / (innerHeight * 0.135), 0, 1);
          contact.style.setProperty('--match-email-mask', 100 * (1 - reveal) + '%');
        }
      }
      film.toggleAttribute('data-study-matched', matching && progress >= 0.995);
      film.toggleAttribute('data-study-leaving', matching && contactTop < innerHeight - 12);
      document.body.toggleAttribute('data-study-poster', usePoster);
      show(active);
    };

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function onPosterLoad(event: Event) {
      if (event.target instanceof HTMLImageElement && event.target.closest('.contact-poster'))
        schedule();
    }

    const observer = new IntersectionObserver(schedule, { rootMargin: '160px 0px' });
    observer.observe(film);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    document.addEventListener('load', onPosterLoad, true);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      document.removeEventListener('load', onPosterLoad, true);
      document.body.removeAttribute('data-study-poster');
      film.removeAttribute('data-study-matched');
      film.removeAttribute('data-study-leaving');
      show(false);
    };
  }, [track, liveReady]);
}
