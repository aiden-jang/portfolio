import { useEffect } from 'react';
import { clamp } from '../math';
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
    if (!intro || !work || !contact) return;

    const root = document.documentElement;
    root.setAttribute('data-featured-globe-cut', '');
    const { refs } = useAppStore.getState();
    let workOffset = 0;
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
      const movingForward = scrollY >= lastScroll;
      lastScroll = scrollY;
      if (progress < 0.05) visitedIntro = true;

      const contactTop = contact.getBoundingClientRect().top;
      const contactProgress = (h - contactTop) / h;
      const inContact = contactProgress > 0;
      const workTop = work.getBoundingClientRect().top - workOffset;
      const handingOff = !reduced && !inContact && workTop > 1 && workTop < h;
      refs.floorReflection = 1;
      root.toggleAttribute('data-showroom-handoff', handingOff);
      const beforeCut = !reduced && workTop > h * 0.34;
      root.toggleAttribute('data-before-globe-cut', beforeCut);
      workOffset = !reduced && !beforeCut ? -Math.max(0, workTop - (phone ? 84 : 88)) : 0;
      root.style.setProperty('--globe-cut-offset', workOffset + 'px');

      if (!reduced) {
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
      root.style.setProperty('--stage-opacity', '1');

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
      refs.floorReflection = 1;
      root.removeAttribute('data-showroom-handoff');
      root.removeAttribute('data-featured-globe-cut');
      root.removeAttribute('data-before-globe-cut');
      for (const name of [
        '--header-scrim',
        '--stage-opacity',
        '--garage-controls-opacity',
        '--globe-cut-offset',
      ]) {
        root.style.removeProperty(name);
      }
    };
  }, []);
}
