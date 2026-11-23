import { useEffect } from 'react';
import { clamp, lerp } from '../math';
import { useAppStore } from '../store';

const ART = '.orbit-art[data-poster="true"]';
const PULSE = 'data-kamchatka-pulse';

function smoothProgress(value: number, start: number, end: number) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

function revealMarker(poster: HTMLElement, rect: DOMRect, viewport: number) {
  const image = poster.querySelector('img');
  if (!image?.naturalWidth) return false;

  const { clientWidth: width, clientHeight: height } = poster;
  if (!height || !width) return false;
  // The shared poster and canvas frame uses a different camera crop on phones.
  const narrow = image.naturalWidth < image.naturalHeight;
  const x = width * (narrow ? 177 / 390 : 585 / 1120);
  const y = height * (narrow ? 159 / 440 : 287 / 732);
  const viewportY = rect.top + (y / height) * rect.height;
  if (viewportY < viewport * 0.22 || viewportY > viewport * 0.68) return false;

  poster.style.setProperty('--kamchatka-x', `${x}px`);
  poster.style.setProperty('--kamchatka-y', `${y}px`);
  poster.setAttribute(PULSE, '');
  return true;
}

export function useShowroomTransition() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const intro = document.getElementById('sec-intro');
    const work = document.getElementById('sec-work');
    const contact = document.getElementById('sec-contact');
    const plot = document.querySelector<HTMLElement>('.bloom-garden-plot');
    if (!intro || !work || !contact) return;

    const root = document.documentElement;
    const { refs } = useAppStore.getState();
    let frame = 0;
    let visitedIntro = false;
    let highlighted = !!location.hash && location.hash !== '#sec-intro';
    let lastScroll = scrollY;
    let pulsingPoster: HTMLElement | null = null;
    const clearPulse = () => {
      pulsingPoster?.removeAttribute(PULSE);
      pulsingPoster?.style.removeProperty('--kamchatka-x');
      pulsingPoster?.style.removeProperty('--kamchatka-y');
      pulsingPoster = null;
    };
    const paint = () => {
      frame = 0;
      const h = Math.max(1, innerHeight);
      const progress = scrollY / h;
      const reduced = media.matches;
      const phone = innerWidth < 768;
      const headerTravel = phone ? 62 : 88;
      const headerScrim = reduced
        ? Number(scrollY >= headerTravel / 2)
        : smoothProgress(scrollY, 0, headerTravel);
      if (plot && !reduced) {
        const remaining = clamp((plot.getBoundingClientRect().top - h * 0.49) / (h * 0.44), 0, 1);
        plot.style.setProperty('--garden-arrival', remaining ** 2 * (phone ? 22 : 42) + 'px');
      }
      const movingForward = scrollY >= lastScroll;
      lastScroll = scrollY;
      if (progress < 0.05) visitedIntro = true;

      const contactProgress = (h - contact.getBoundingClientRect().top) / h;
      const inContact = contactProgress > 0;
      refs.floorReflection =
        reduced || inContact ? 1 : lerp(1, 0.07, smoothProgress(progress, 0.08, 0.52));

      const fadeEnd = 0.91;
      root.toggleAttribute(
        'data-showroom-handoff',
        !reduced && !inContact && progress > 0.09 && progress < fadeEnd,
      );

      let stage = 1;
      if (!reduced) {
        stage = inContact
          ? smoothProgress(contactProgress, 0.05, phone ? 0.48 : 0.44)
          : 1 - smoothProgress(progress, 0.79, fadeEnd);
        // Finish the fade where the dock stops fitting in the Intro viewport.
        const dockEnd = Math.max(0.015, (intro.offsetHeight + 0.5) / h - 1);
        const dock = 1 - smoothProgress(progress, dockEnd * 0.64, dockEnd);
        root.style.setProperty('--garage-controls-opacity', String(dock));
      } else {
        root.style.removeProperty('--garage-controls-opacity');
      }

      const poster = reduced ? null : work.querySelector<HTMLElement>(ART);
      const rect = poster?.getBoundingClientRect();

      root.style.setProperty('--header-scrim', String(headerScrim));
      root.style.setProperty('--stage-opacity', String(stage));

      if (pulsingPoster && (pulsingPoster !== poster || !movingForward)) clearPulse();
      if (
        !highlighted &&
        visitedIntro &&
        movingForward &&
        poster &&
        rect &&
        rect.top < h &&
        poster.closest('.orbit-feature')?.getAttribute('data-globe-phase') !== 'ready'
      ) {
        highlighted = revealMarker(poster, rect, h);
        if (highlighted) pulsingPoster = poster;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const endPulse = (event: AnimationEvent) => {
      if (event.target === pulsingPoster && event.animationName === 'kamchatka-pulse') clearPulse();
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    work.addEventListener('load', schedule, true);
    work.addEventListener('animationend', endPulse);
    work.addEventListener('animationcancel', endPulse);
    paint();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
      work.removeEventListener('load', schedule, true);
      work.removeEventListener('animationend', endPulse);
      work.removeEventListener('animationcancel', endPulse);
      clearPulse();
      plot?.style.removeProperty('--garden-arrival');
      refs.floorReflection = 1;
      root.removeAttribute('data-showroom-handoff');
      for (const name of ['--header-scrim', '--stage-opacity', '--garage-controls-opacity']) {
        root.style.removeProperty(name);
      }
    };
  }, []);
}
