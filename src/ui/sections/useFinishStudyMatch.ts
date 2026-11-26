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
    const contact = document.getElementById('sec-contact');
    if (!film || !stage || !about || !contact || !liveReady) return;

    const motion = matchMedia(finishStudyMotion);
    let nearby = false;
    let frame = 0;
    function show(active: boolean) {
      document.body.toggleAttribute('data-study-match', active);
      if (useFinishStudy.getState().active !== active) useFinishStudy.setState({ active });
    }

    const update = () => {
      frame = 0;
      const bounds = film.getBoundingClientRect();
      const contactTop = contact.getBoundingClientRect().top;
      // A fragment jump can leave the aligned section a fraction of a CSS pixel below the top.
      const active = motion.matches && bounds.top < innerHeight && contactTop > 1;
      if (active) {
        finishStudyFrame.top = Math.max(0, bounds.top);
        finishStudyFrame.progress = finishStudyProgress(
          bounds.top,
          bounds.height - stage.offsetHeight,
        );
        about.style.setProperty(
          '--study-start',
          bounds.top - about.getBoundingClientRect().top + 'px',
        );
        if (contactTop < innerHeight - 12) {
          const reveal = clamp((innerHeight * 0.17 - contactTop) / (innerHeight * 0.135), 0, 1);
          contact.style.setProperty('--match-email-mask', 100 * (1 - reveal) + '%');
        }
      }
      film.toggleAttribute('data-study-matched', active && finishStudyFrame.progress >= 0.995);
      film.toggleAttribute('data-study-leaving', active && contactTop < innerHeight - 12);
      show(active);
    };

    function schedule() {
      if (!frame && (nearby || useFinishStudy.getState().active))
        frame = requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        nearby = entry.isIntersecting;
        schedule();
      },
      { rootMargin: '160px 0px' },
    );
    observer.observe(film);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      film.removeAttribute('data-study-matched');
      film.removeAttribute('data-study-leaving');
      show(false);
    };
  }, [track, liveReady]);
}
