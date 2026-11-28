import { useEffect } from 'react';
import { GLOBE_CUT_VIEWPORT_FRACTION } from '../config';
import { advanceQuake } from '../ui/showcase/quakeProgress';
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
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const imageWidth = narrow ? image.naturalWidth * scale : width;
  const imageHeight = narrow ? image.naturalHeight * scale : height;
  const x = (width - imageWidth) / 2 + imageWidth * (narrow ? 177 / 390 : 585 / 1120);
  const y = (height - imageHeight) / 2 + imageHeight * (narrow ? 159 / 440 : 287 / 732);
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

    const quake = work.querySelector<HTMLElement>('.quake-journey-run');
    const root = document.documentElement;
    root.setAttribute('data-featured-globe-cut', '');
    const { refs } = useAppStore.getState();
    let frame = 0;
    let focus = 0;
    let previousTime = 0;
    let visitedIntro = false;
    let highlighted = !!location.hash && location.hash !== '#sec-intro';
    let lastScroll = scrollY;
    let pulsingPoster: HTMLElement | null = null;
    let lastScrim = -1;
    let lastDock = -1;
    root.style.setProperty('--stage-opacity', '1');
    const clearPulse = () => {
      pulsingPoster?.removeAttribute(PULSE);
      pulsingPoster?.style.removeProperty('--kamchatka-x');
      pulsingPoster?.style.removeProperty('--kamchatka-y');
      pulsingPoster = null;
    };
    const paint = (now: number) => {
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
      const workTop = work.getBoundingClientRect().top;
      const handingOff = !reduced && !inContact && workTop > 1 && workTop < h;
      refs.floorReflection = 1;
      root.toggleAttribute('data-showroom-handoff', handingOff);
      const beforeCut = !reduced && workTop > h * GLOBE_CUT_VIEWPORT_FRACTION;
      root.toggleAttribute('data-before-globe-cut', beforeCut);
      // Use the section's natural position. Its pinned position can stay still while scrolling.
      if (quake) {
        const target = reduced ? 1 : smoothProgress(-workTop / h, -0.72, 0.08);
        const gap = target - focus;
        const dt = Math.min(80, Math.max(8, now - previousTime));
        const visible = !beforeCut && workTop > -h;
        focus =
          !visible || reduced || Math.abs(gap) < 0.0008
            ? target
            : focus + gap * (1 - Math.exp(-dt / 64));
        previousTime = now;
        advanceQuake(quake, focus, reduced);
        if (focus !== target) schedule();
      }

      // Finish the fade where the dock stops fitting in the Intro viewport.
      const dockEnd = Math.max(0.015, (intro.offsetHeight + 0.5) / h - 1);
      const dock = reduced ? -1 : 1 - smoothProgress(progress, dockEnd * 0.64, dockEnd);
      if (dock !== lastDock) {
        lastDock = dock;
        if (reduced) root.style.removeProperty('--garage-controls-opacity');
        else root.style.setProperty('--garage-controls-opacity', String(dock));
      }
      if (headerScrim !== lastScrim) {
        lastScrim = headerScrim;
        root.style.setProperty('--header-scrim', String(headerScrim));
      }

      const poster =
        !reduced && (pulsingPoster || (!beforeCut && !highlighted && workTop > -h))
          ? work.querySelector<HTMLElement>(ART)
          : null;
      const rect = poster?.getBoundingClientRect();

      if (pulsingPoster && (pulsingPoster !== poster || !movingForward)) clearPulse();
      if (
        !beforeCut &&
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
    const revealFocusedGlobe = (event: FocusEvent) => {
      if (
        root.hasAttribute('data-before-globe-cut') &&
        event.target instanceof Node &&
        quake?.contains(event.target) &&
        work.getBoundingClientRect().top > innerHeight * GLOBE_CUT_VIEWPORT_FRACTION
      ) {
        work.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    work.addEventListener('load', schedule, true);
    work.addEventListener('focusin', revealFocusedGlobe);
    work.addEventListener('animationend', endPulse);
    work.addEventListener('animationcancel', endPulse);
    paint(performance.now());
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
      work.removeEventListener('load', schedule, true);
      work.removeEventListener('focusin', revealFocusedGlobe);
      work.removeEventListener('animationend', endPulse);
      work.removeEventListener('animationcancel', endPulse);
      clearPulse();
      refs.floorReflection = 1;
      root.removeAttribute('data-showroom-handoff');
      root.removeAttribute('data-featured-globe-cut');
      root.removeAttribute('data-before-globe-cut');
      for (const name of ['--header-scrim', '--stage-opacity', '--garage-controls-opacity']) {
        root.style.removeProperty(name);
      }
    };
  }, []);
}
