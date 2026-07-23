import { useCallback, useEffect, useRef } from 'react';
import { SECTION_IDS, type SectionId } from '../config';
import { clamp } from '../math';
import { prefersReducedMotion } from './useReducedMotion';
import { useAppStore } from '../store';

let scrollRaf = 0;
// Set while a programmatic tween owns the scroll; restores the CSS-driven snap.
// Exposed via cancelSmoothScroll so manual scroll input can abort the tween.
let restoreSnap: (() => void) | null = null;

/** Abort any in-flight programmatic scroll and restore scroll-snap immediately.
 *  Called when the user takes over (touch / wheel) so the tween never fights a
 *  manual scroll, and snap is never left disabled. */
function cancelSmoothScroll(): void {
  if (scrollRaf) {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = 0;
  }
  if (restoreSnap) {
    restoreSnap();
    restoreSnap = null;
  }
}

/** Scroll the window to an absolute Y for a section jump.
 *
 *  Touch devices get an INSTANT jump, on purpose. Native `behavior: 'smooth'` does
 *  nothing under `scroll-snap-type: mandatory`, and a per-frame rAF tween that
 *  toggles snap off fights the browser's re-applied snapping on real phones (it
 *  looks fine in a desktop mobile-emulator but stalls / lands wrong on device).
 *  targetY is always a section's exact snap-start, so an instant `scrollTo` lands
 *  cleanly with snap left on — the most reliable thing that works on a real phone.
 *  Desktop (fine-pointer) keeps the smooth rAF tween below. */
function smoothScrollTo(targetY: number): void {
  const startY = window.scrollY;
  const dist = targetY - startY;
  if (Math.abs(dist) < 2) return;

  const coarsePointer =
    typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (coarsePointer || prefersReducedMotion()) {
    cancelSmoothScroll(); // kill any tween mid-flight; then jump instantly
    window.scrollTo(0, targetY);
    return;
  }

  const html = document.documentElement;
  cancelSmoothScroll();
  html.style.scrollSnapType = 'none';
  restoreSnap = () => {
    html.style.scrollSnapType = ''; // restore the CSS-driven mandatory snap
  };
  const duration = 480;
  const start = performance.now();
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, Math.round(startY + dist * ease(t)));
    if (t < 1) {
      scrollRaf = requestAnimationFrame(step);
    } else {
      scrollRaf = 0;
      if (restoreSnap) {
        restoreSnap();
        restoreSnap = null;
      }
    }
  };
  scrollRaf = requestAnimationFrame(step);
}

/** After a deliberate jump (keyboard / nav / dots) this long, ignore scroll
 *  events so the smooth-scroll animation isn't overridden mid-flight. */
const SNAP_LOCK_MS = 900;
/** Cooldown between car cycles (the GLB swap is async + self-throttling). */
const CAR_LOCK_MS = 600;
/** Horizontal wheel events below this magnitude are ignored — small jitter
 *  from a mouse should not cycle the car. */
const MIN_WHEEL_DELTA = 10;

/** Section navigation. Vertical scrolling is left FULLY native — no JS tween,
 *  no paging — which is the smoothest with a wheel/trackpad (the camera rig
 *  interpolates continuously off scrollY, so sections still read as distinct
 *  stops). Mobile adds native CSS scroll-snap in index.css. Keyboard, nav, and
 *  the dots jump with native smooth-scroll. Horizontal trackpad wheel cycles
 *  cars on desktop. Exposes `getScrollT` for the camera rig. */
export function useNavigation() {
  const setSectionIndex = useAppStore((s) => s.setSectionIndex);
  const snapLockUntil = useRef(0);
  const currentSection = useRef(0);
  const carLockUntil = useRef(0);

  const cycleCarThrottled = useCallback(() => {
    const now = performance.now();
    if (now < carLockUntil.current) return;
    carLockUntil.current = now + CAR_LOCK_MS;
    useAppStore.getState().cycleCar();
  }, []);
  const prevCarThrottled = useCallback(() => {
    const now = performance.now();
    if (now < carLockUntil.current) return;
    carLockUntil.current = now + CAR_LOCK_MS;
    useAppStore.getState().prevCar();
  }, []);

  const getScrollT = useCallback((): number => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max <= 0 ? 0 : clamp(window.scrollY / max, 0, 1);
  }, []);

  const goToSection = useCallback(
    (idx: number): void => {
      const next = clamp(idx, 0, SECTION_IDS.length - 1);
      currentSection.current = next;
      snapLockUntil.current = performance.now() + SNAP_LOCK_MS;
      const el = document.getElementById(SECTION_IDS[next]);
      if (!el) return;
      const targetY = el.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(targetY);
      setSectionIndex(next);
    },
    [setSectionIndex],
  );

  useEffect(() => {
    // The user grabbed the scroll: abort any in-flight jump so the tween doesn't
    // fight them, and drop the snap-lock so the active-section highlight tracks
    // their manual scroll again right away (rather than staying frozen on the
    // jump target). This is what makes mixing scroll + dots/title feel coherent.
    const yieldToUser = () => {
      cancelSmoothScroll();
      snapLockUntil.current = 0;
    };
    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      // Horizontal trackpad swipe → cycle cars. Vertical wheel is native scroll,
      // but it also means the user is taking over, so yield any in-flight jump.
      if (absX > absY && absX >= MIN_WHEEL_DELTA) {
        if (e.deltaX > 0) cycleCarThrottled();
        else prevCarThrottled();
      } else if (absY >= MIN_WHEEL_DELTA) {
        yieldToUser();
      }
    };
    const onTouchStart = () => yieldToUser();
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        !!target?.isContentEditable;
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          goToSection(currentSection.current + 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          goToSection(currentSection.current - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          cycleCarThrottled();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevCarThrottled();
          break;
        case 'Home':
          e.preventDefault();
          goToSection(0);
          break;
        case 'End':
          e.preventDefault();
          goToSection(SECTION_IDS.length - 1);
          break;
        case 'c':
        case 'C':
          if (inField) return;
          e.preventDefault();
          useAppStore.getState().cycleBodyColor();
          break;
        case 'b':
        case 'B':
          if (inField) return;
          e.preventDefault();
          useAppStore.getState().toggleTheme();
          break;
      }
    };
    // Track the active section for the nav dots / label as you scroll. A
    // deliberate jump holds the lock so this doesn't fight its animation.
    const onScroll = () => {
      if (performance.now() < snapLockUntil.current) return;
      const idx = Math.round(getScrollT() * (SECTION_IDS.length - 1));
      currentSection.current = idx;
      setSectionIndex(idx);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [getScrollT, goToSection, setSectionIndex, cycleCarThrottled, prevCarThrottled]);

  return {
    goToSection,
    getScrollT,
    scrollToSection: (id: SectionId) => goToSection(SECTION_IDS.indexOf(id)),
  };
}
