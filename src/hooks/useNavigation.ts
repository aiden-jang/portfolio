import { useCallback, useEffect, useRef } from 'react';
import { SECTION_IDS, type SectionId } from '../config';
import { clamp } from '../math';
import { useAppStore } from '../store';
import { prefersReducedMotion } from './useReducedMotion';

const SNAP_LOCK_MS = 1100;
/** Settle-to-section: scrolling stays fully native (so the wheel/trackpad never
 *  fight an active gesture), then this long after scrolling STOPS we ease to the
 *  nearest section so the page never rests partway between sections. */
const SETTLE_DELAY_MS = 150;
/** Already within this many px of a section top: leave it, don't nudge. */
const SETTLE_TOLERANCE_PX = 4;
/** The settle glide is a custom eased tween (smoother than native smooth
 *  scroll). Duration scales with distance, clamped to this range, so a short
 *  nudge and a near-full-screen glide both feel right. */
const SETTLE_MS_PER_PX = 0.85;
const SETTLE_MIN_MS = 380;
const SETTLE_MAX_MS = 720;

/** Smooth, symmetric ease (slow in, slow out) for the settle glide. */
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** Cooldown between car cycles (lighter than section snap since GLB swap is
 *  async and self-throttling). */
const CAR_LOCK_MS = 600;
/** Horizontal wheel events below this magnitude are ignored — small jitter
 *  from a mouse should not cycle the car. */
const MIN_WHEEL_DELTA = 10;
/** Touch-swipe gates: must be a clear, quick flick to count as a car cycle
 *  (slow drags are reserved for the camera-rig orbit). Requires both a
 *  minimum distance AND a minimum velocity. Tuned loose enough that a normal
 *  thumb-flick registers without forcing a hard snap. */
const SWIPE_MIN_DIST = 60;
const SWIPE_MAX_MS = 450;
const SWIPE_MIN_VELOCITY = 0.3; // pixels per ms
/** Axis dominance ratio — the main-axis distance must beat the cross-axis
 *  by at least this factor, so diagonal drags (orbit) don't trigger nav. */
const SWIPE_AXIS_RATIO = 1.6;

/** Keyboard/touch section navigation. Vertical scrolling is fully native (no
 *  CSS scroll-snap, which fought the mouse wheel); instead, once scrolling
 *  stops we ease to the nearest section so it still settles cleanly without
 *  fighting any input mid-gesture. Horizontal wheel still cycles cars. Exposes
 *  `getScrollT` for the camera rig to interpolate keyframes by. */
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
      if (next === currentSection.current && performance.now() < snapLockUntil.current) {
        return;
      }
      currentSection.current = next;
      snapLockUntil.current = performance.now() + SNAP_LOCK_MS;
      const el = document.getElementById(SECTION_IDS[next]);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSectionIndex(next);
    },
    [setSectionIndex],
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      cancelTween(); // a real wheel tick should hand control back instantly
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      // Horizontal trackpad swipe → cycle through cars. Vertical wheel/scroll
      // is intentionally left to the browser as plain native scrolling.
      if (absX > absY && absX >= MIN_WHEEL_DELTA) {
        if (e.deltaX > 0) cycleCarThrottled();
        else prevCarThrottled();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      cancelTween(); // any keypress hands control back from an in-flight glide
      // Don't intercept letter keys while the user is typing in a form field.
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
    // Custom eased scroll tween — smoother and more tunable than native
    // `scrollTo({behavior:'smooth'})`. Any user input (wheel/touch/key) calls
    // cancelTween to hand control straight back, so it never fights you.
    let settleTimer = 0;
    let tweenRaf = 0;
    const cancelTween = () => {
      if (!tweenRaf) return;
      cancelAnimationFrame(tweenRaf);
      tweenRaf = 0;
      snapLockUntil.current = 0; // we were mid-settle; release so input takes over
    };
    const tweenScrollTo = (targetY: number) => {
      cancelTween();
      const startY = window.scrollY;
      const dist = targetY - startY;
      const duration = clamp(Math.abs(dist) * SETTLE_MS_PER_PX, SETTLE_MIN_MS, SETTLE_MAX_MS);
      // Hold the lock across the whole glide (+ the settle debounce) so the
      // tween's own scroll events don't re-trigger a settle mid-flight.
      snapLockUntil.current = performance.now() + duration + SETTLE_DELAY_MS + 60;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        window.scrollTo(0, startY + dist * easeInOutCubic(t));
        tweenRaf = t < 1 ? requestAnimationFrame(step) : 0;
      };
      tweenRaf = requestAnimationFrame(step);
    };

    // Ease to the nearest section after scrolling has stopped. Uses each
    // section's real offsetTop (sections aren't a fixed viewport tall on mobile,
    // where padding can make them taller) so it lands true.
    const settleToNearest = () => {
      // A keyboard / nav-link / dot jump owns the scroll while its lock holds.
      if (performance.now() < snapLockUntil.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const y = window.scrollY;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < SECTION_IDS.length; i++) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (!el) continue;
        const d = Math.abs(el.offsetTop - y);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      const el = document.getElementById(SECTION_IDS[best]);
      if (!el) return;
      const targetY = clamp(el.offsetTop, 0, max);
      if (Math.abs(targetY - y) <= SETTLE_TOLERANCE_PX) return;
      currentSection.current = best;
      setSectionIndex(best);
      if (prefersReducedMotion()) {
        window.scrollTo(0, targetY);
        return;
      }
      tweenScrollTo(targetY);
    };
    const onScroll = () => {
      const t = getScrollT() * (SECTION_IDS.length - 1);
      const idx = Math.round(t);
      if (performance.now() >= snapLockUntil.current) {
        currentSection.current = idx;
        setSectionIndex(idx);
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settleToNearest, SETTLE_DELAY_MS);
    };
    // Touch swipes (mobile): horizontal flick → cycle cars. Vertical scrolling
    // is left entirely to native scroll, matching the desktop wheel behavior.
    // Single-touch only so pinch-zoom / multi-finger gestures pass through
    // untouched.
    let touchX = 0;
    let touchY = 0;
    let touchTime = 0;
    const onTouchStart = (e: TouchEvent) => {
      cancelTween(); // a finger on the screen interrupts the settle glide
      if (e.touches.length !== 1) {
        touchTime = 0;
        return;
      }
      const t = e.touches[0];
      touchX = t.clientX;
      touchY = t.clientY;
      touchTime = performance.now();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchTime || e.changedTouches.length !== 1) return;
      const elapsed = performance.now() - touchTime;
      touchTime = 0;
      // Must be a quick gesture — slower touches are camera-rig drags.
      if (elapsed > SWIPE_MAX_MS) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchX;
      const dy = t.clientY - touchY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      // Vertical gestures fall through to native scroll-snap — only a clearly
      // horizontal flick (not a diagonal orbit drag) cycles cars.
      if (absX < absY * SWIPE_AXIS_RATIO) return;
      if (absX < SWIPE_MIN_DIST) return;
      // Must be a clear flick, not a careful slow swipe.
      if (absX / elapsed < SWIPE_MIN_VELOCITY) return;
      // Let modals / interactive elements consume their own touches.
      const target = e.target as HTMLElement | null;
      if (target?.closest('a, button, input, [role="dialog"]')) return;
      if (dx < 0) cycleCarThrottled();
      else prevCarThrottled();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(settleTimer);
      cancelTween();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [getScrollT, goToSection, setSectionIndex, cycleCarThrottled, prevCarThrottled]);

  return { goToSection, getScrollT, scrollToSection: (id: SectionId) => goToSection(SECTION_IDS.indexOf(id)) };
}
