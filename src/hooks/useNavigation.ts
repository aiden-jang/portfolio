import { useCallback, useEffect, useRef } from 'react';
import { CARS, SECTION_IDS, type SectionId } from '../config';
import { clamp } from '../math';
import { prefersReducedMotion } from './useReducedMotion';
import { useAppStore } from '../store';

let scrollRaf = 0;
// Module-level so manual scroll input can abort a tween started from anywhere.
let restoreSnap: (() => void) | null = null;

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

// Snap has to stay off for the whole jump and past the end of it. A phone with snap on re-snaps
// mid-tween and reverts the jump, leaving the dot on one section and the copy on another. Coarse
// pointers also need the native scroll, because a rAF tween stalls on a real phone.
function smoothScrollTo(targetY: number): void {
  const startY = window.scrollY;
  const dist = targetY - startY;
  if (Math.abs(dist) < 2) return;

  cancelSmoothScroll();
  const html = document.documentElement;
  html.style.scrollSnapType = 'none';
  restoreSnap = () => {
    html.style.scrollSnapType = '';
  };

  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    return;
  }

  const coarsePointer = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (coarsePointer) {
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    return;
  }

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
    }
  };
  scrollRaf = requestAnimationFrame(step);
}

// How long a deliberate jump ignores scroll events, so it isn't overridden mid-flight.
const SNAP_LOCK_MS = 900;
// The GLB swap is async, so cycling faster than this queues loads nobody sees.
const CAR_LOCK_MS = 600;
// Below this, a mouse's horizontal jitter would cycle the car on its own.
const MIN_WHEEL_DELTA = 10;

export function useNavigation() {
  const setSectionIndex = useAppStore((s) => s.setSectionIndex);
  const snapLockUntil = useRef(0);
  const currentSection = useRef(0);
  const carLockUntil = useRef(0);

  const cycleCarThrottled = useCallback(() => {
    const now = performance.now();
    if (now < carLockUntil.current) return;
    if (useAppStore.getState().isCarLoading) return;
    carLockUntil.current = now + CAR_LOCK_MS;
    useAppStore.getState().cycleCar();
  }, []);
  const prevCarThrottled = useCallback(() => {
    const now = performance.now();
    if (now < carLockUntil.current) return;
    if (useAppStore.getState().isCarLoading) return;
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
    const dialogIsOpen = () =>
      !!document.querySelector('[role="dialog"][aria-modal="true"]:not([aria-hidden="true"])');
    // Clearing the lock as well as the tween is what stops the section highlight from staying
    // frozen on the jump target once the user scrolls away from it.
    const yieldToUser = () => {
      cancelSmoothScroll();
      snapLockUntil.current = 0;
    };
    const onWheel = (e: WheelEvent) => {
      if (dialogIsOpen()) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      // Vertical wheel stays native scroll, but it still means the user is taking over.
      if (absX > absY && absX >= MIN_WHEEL_DELTA) {
        if (e.deltaX > 0) cycleCarThrottled();
        else prevCarThrottled();
      } else if (absY >= MIN_WHEEL_DELTA) {
        yieldToUser();
      }
    };
    const onTouchStart = () => {
      if (!dialogIsOpen()) yieldToUser();
    };
    const onKey = (e: KeyboardEvent) => {
      if (dialogIsOpen()) return;
      const target = e.target as HTMLElement | null;
      const inField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        !!target?.isContentEditable;
      // Without this, arrow keys in the command palette also scroll the page behind it.
      if (inField) return;
      if (/^[1-9]$/.test(e.key)) {
        const carIndex = Number(e.key) - 1;
        if (carIndex < CARS.length) {
          e.preventDefault();
          const state = useAppStore.getState();
          if (!state.isCarLoading && state.carIndex !== carIndex) state.setCarIndex(carIndex);
        }
        return;
      }
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
          e.preventDefault();
          if (!useAppStore.getState().isCarLoading) useAppStore.getState().cycleBodyColor();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          useAppStore.getState().toggleTheme();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          useAppStore.getState().triggerRev();
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          useAppStore.getState().resetCamera();
          break;
        case 'x':
        case 'X':
          e.preventDefault();
          if (!useAppStore.getState().isCarLoading) useAppStore.getState().randomizeGarage();
          break;
      }
    };
    // The lock is what keeps a deliberate jump from fighting its own animation.
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
