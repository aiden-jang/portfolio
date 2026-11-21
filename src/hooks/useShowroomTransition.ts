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
      const movingForward = scrollY >= lastScroll;
      lastScroll = scrollY;
      if (progress < 0.05) visitedIntro = true;

      const contactProgress = (h - contact.getBoundingClientRect().top) / h;
      const inContact = contactProgress > 0;
      refs.floorReflection =
        reduced || inContact ? 1 : lerp(1, 0.07, smoothProgress(progress, 0.08, 0.52));

      let stage = 1;
      if (!reduced) {
        stage = inContact
          ? smoothProgress(contactProgress, 0.05, phone ? 0.48 : 0.44)
          : 1 - smoothProgress(progress, phone ? 0.14 : 0.2, phone ? 0.72 : 0.84);
        // Finish the fade where the dock stops fitting in the Intro viewport.
        const dockEnd = Math.max(0.015, (intro.offsetHeight + 0.5) / h - 1);
        const dock = 1 - smoothProgress(progress, 0.005, dockEnd);
        const glow = smoothProgress(contactProgress, 0.32, 0.94);
        root.style.setProperty('--garage-controls-opacity', String(dock));
        root.style.setProperty('--contact-glow-opacity', String(glow));
      } else {
        root.style.removeProperty('--garage-controls-opacity');
        root.style.removeProperty('--contact-glow-opacity');
      }

      const arrival = clamp((h * 0.95 - work.getBoundingClientRect().top) / (h * 0.9), 0, 1);
      const scale = reduced ? 1 : lerp(0.965, 1, arrival);
      const poster = reduced ? null : work.querySelector<HTMLElement>(ART);
      const rect = poster?.getBoundingClientRect();
      const globe = rect ? lerp(0.56, 1, smoothProgress((h - rect.top) / h, 0, 0.57)) : 1;

      root.style.setProperty('--header-scrim', String(headerScrim));
      root.style.setProperty('--stage-opacity', String(stage));
      root.style.setProperty('--work-figure-scale', String(scale));
      root.style.setProperty('--work-poster-opacity', String(globe));
      const cut = smoothProgress(progress, phone ? 0.57 : 0.61, phone ? 0.96 : 0.99);
      const showPoint = !reduced && visitedIntro && rect && cut > 0 && cut < 1;
      if (showPoint && rect) {
        const endX = rect.left + rect.width * (phone ? 177 / 390 : 585 / 1120);
        const endY = rect.top + rect.height * (phone ? 159 / 440 : 287 / 732);
        root.style.setProperty(
          '--creative-point-x',
          lerp(innerWidth * (phone ? 0.53 : 0.44), endX, cut) + 'px',
        );
        root.style.setProperty('--creative-point-y', lerp(h * 0.69, endY, cut) + 'px');
        root.style.setProperty('--creative-point-opacity', String(Math.sin(cut * Math.PI) * 0.83));
      } else root.style.setProperty('--creative-point-opacity', '0');

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
      for (const name of [
        '--header-scrim',
        '--stage-opacity',
        '--work-figure-scale',
        '--work-poster-opacity',
        '--garage-controls-opacity',
        '--contact-glow-opacity',
      ]) {
        root.style.removeProperty(name);
      }
    };
  }, []);
}
