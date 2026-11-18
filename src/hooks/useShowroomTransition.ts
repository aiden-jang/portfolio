import { useEffect } from 'react';
import { clamp, lerp } from '../math';
import { useAppStore } from '../store';

const POSTER = ".orbit-feature[data-globe-phase='idle'] .preview-thumbnail[data-poster='true']";
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
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const objectPosition = getComputedStyle(image).objectPosition;
  const [focusX, focusY] = objectPosition.split(' ').map((value) => parseFloat(value) / 100);
  // The point is baked into the globe poster. Follow its object-fit crop at each width.
  const x =
    (width - image.naturalWidth * scale) * focusX + (567 / 1080) * image.naturalWidth * scale;
  const y =
    (height - image.naturalHeight * scale) * focusY + (255 / 706) * image.naturalHeight * scale;
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
      const h = innerHeight;
      const progress = scrollY / h;
      const movingForward = scrollY >= lastScroll;
      lastScroll = scrollY;
      if (progress < 0.05) visitedIntro = true;

      const fixedScene = media.matches || contact.getBoundingClientRect().top < h;
      refs.floorReflection = fixedScene ? 1 : lerp(1, 0.07, smoothProgress(progress, 0.08, 0.52));
      const stage = fixedScene ? 1 : 1 - smoothProgress(progress, 0.25, 0.92);
      const arrival = clamp((h * 0.95 - work.getBoundingClientRect().top) / (h * 0.9), 0, 1);
      const scale = media.matches ? 1 : lerp(0.965, 1, arrival);
      const poster = media.matches ? null : work.querySelector<HTMLElement>(POSTER);
      const rect = poster?.getBoundingClientRect();
      const globe = rect ? lerp(0.56, 1, smoothProgress((h - rect.top) / h, 0, 0.57)) : 1;

      root.style.setProperty('--stage-opacity', String(stage));
      root.style.setProperty('--work-figure-scale', String(scale));
      root.style.setProperty('--work-poster-opacity', String(globe));

      if (pulsingPoster && (pulsingPoster !== poster || !movingForward)) clearPulse();
      if (!highlighted && visitedIntro && movingForward && poster && rect && rect.top < h) {
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
      for (const name of ['--stage-opacity', '--work-figure-scale', '--work-poster-opacity'])
        root.style.removeProperty(name);
    };
  }, []);
}
