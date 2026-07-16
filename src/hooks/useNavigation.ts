import { useCallback, useEffect, useRef } from 'react';
import { SECTION_IDS, type SectionId } from '../config';
import { clamp } from '../math';
import { useAppStore } from '../store';
import { prefersReducedMotion } from './useReducedMotion';

const SNAP_LOCK_MS = 1100;
/** Settle-to-section: scrolling stays fully native (so the wheel/trackpad never
 *  fight an active gesture), then this long after scrolling STOPS we ease to the
 *  nearest section so the page never rests partway between sections. */
const SETTLE_DELAY_MS = 40;
/** Already within this many px of a section top: leave it, don't nudge. */
const SETTLE_TOLERANCE_PX = 4;
/** How far into the gap toward the next section you must scroll before the
 *  settle completes to it (vs. staying on the current one). Keeps the settle
 *  moving with you instead of snapping back to whichever section is nearest. */
const SETTLE_COMMIT_FRACTION = 0.15;
/** The settle glide is a custom eased tween (smoother than native smooth
 *  scroll). Duration scales with distance, clamped to this range, so a short
 *  nudge and a near-full-screen glide both feel right. */
const SETTLE_MS_PER_PX = 0.55;
const SETTLE_MIN_MS = 240;
const SETTLE_MAX_MS = 460;

/** Smooth, symmetric ease (slow in, slow out) for the settle glide. */
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** Cooldown between car cycles (lighter than section snap since GLB swap is
 *  async and self-throttling). */
const CAR_LOCK_MS = 600;
/** Horizontal wheel events below this magnitude are ignored — small jitter
 *  from a mouse should not cycle the car. */
const MIN_WHEEL_DELTA = 10;

/** Mobile (≤ the md breakpoint) pages sections with native CSS scroll-snap, so
 *  the JS settle glide below is disabled there to avoid the two fighting. */
const snapsNatively = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

/** Keyboard/wheel section navigation. Vertical scrolling is fully native (no
 *  CSS scroll-snap, which fought the mouse wheel); instead, once scrolling
 *  stops we ease to the nearest section so it still settles cleanly without
 *  fighting any input mid-gesture. Horizontal trackpad wheel cycles cars on
 *  desktop; on mobile that's an explicit control (no swipe), so touch only
 *  ever scrolls vertically. Exposes `getScrollT` for the camera rig. */
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
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      // Horizontal trackpad swipe → cycle through cars.
      if (absX > absY && absX >= MIN_WHEEL_DELTA) {
        cancelTween();
        if (e.deltaX > 0) cycleCarThrottled();
        else prevCarThrottled();
        return;
      }
      // Mobile pages sections with native CSS scroll-snap — leave its scroll alone.
      if (snapsNatively()) return;
      // Vertical (desktop) → page one section per gesture. Prevent native
      // scroll and glide straight to the adjacent section, ignoring the rest of
      // the gesture's momentum. This removes the free-scroll + settle pull-back.
      if (absY < MIN_WHEEL_DELTA) return;
      e.preventDefault();
      if (performance.now() < snapLockUntil.current) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = clamp(currentSection.current + dir, 0, SECTION_IDS.length - 1);
      if (next === currentSection.current) return;
      const el = document.getElementById(SECTION_IDS[next]);
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = clamp(el.offsetTop, 0, max);
      currentSection.current = next;
      setSectionIndex(next);
      if (prefersReducedMotion()) window.scrollTo(0, targetY);
      else tweenScrollTo(targetY);
      // Hold through the glide + the gesture's inertia so one flick = one section.
      snapLockUntil.current = performance.now() + SNAP_LOCK_MS;
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

    // Settle in the DIRECTION of travel after scrolling stops. Once you've
    // scrolled ~a quarter of the way toward the next section, complete to it;
    // otherwise stay on the current one. The old version snapped to the nearest
    // section, which yanked you backward when you stopped mid-gap. Uses real
    // offsetTops (sections can be taller than the viewport on mobile).
    let lastScrollY = window.scrollY;
    let scrollDir = 0;
    const settleToNearest = () => {
      // A keyboard / nav-link / dot jump owns the scroll while its lock holds.
      if (performance.now() < snapLockUntil.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const y = window.scrollY;
      const offsets = SECTION_IDS.map((id) => document.getElementById(id)?.offsetTop ?? 0);
      // The section boundary at or just above the current scroll position.
      let lower = 0;
      for (let i = 0; i < offsets.length; i++) if (offsets[i] <= y + 1) lower = i;
      const upper = Math.min(lower + 1, offsets.length - 1);
      const span = Math.max(1, offsets[upper] - offsets[lower]);
      const f = clamp((y - offsets[lower]) / span, 0, 1);

      let target: number;
      if (lower === upper) target = lower;
      else if (scrollDir > 0) target = f >= SETTLE_COMMIT_FRACTION ? upper : lower;
      else if (scrollDir < 0) target = f <= 1 - SETTLE_COMMIT_FRACTION ? lower : upper;
      else target = f < 0.5 ? lower : upper; // no clear direction: nearest

      const targetY = clamp(offsets[target], 0, max);
      if (Math.abs(targetY - y) <= SETTLE_TOLERANCE_PX) return;
      currentSection.current = target;
      setSectionIndex(target);
      if (prefersReducedMotion()) {
        window.scrollTo(0, targetY);
        return;
      }
      tweenScrollTo(targetY);
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastScrollY) {
        scrollDir = y > lastScrollY ? 1 : -1;
        lastScrollY = y;
      }
      const t = getScrollT() * (SECTION_IDS.length - 1);
      const idx = Math.round(t);
      if (performance.now() >= snapLockUntil.current) {
        currentSection.current = idx;
        setSectionIndex(idx);
      }
      // Mobile pages sections via native CSS scroll-snap; the JS settle glide
      // is desktop-only so the two never fight.
      if (snapsNatively()) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settleToNearest, SETTLE_DELAY_MS);
    };
    // A finger on the screen during the settle glide hands control straight
    // back to native scroll, so the tween never fights a drag. Car cycling on
    // mobile is an explicit control now (not a swipe), so touch only scrolls.
    const onTouchStart = () => cancelTween();

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    return () => {
      window.clearTimeout(settleTimer);
      cancelTween();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, [getScrollT, goToSection, setSectionIndex, cycleCarThrottled, prevCarThrottled]);

  return {
    goToSection,
    getScrollT,
    scrollToSection: (id: SectionId) => goToSection(SECTION_IDS.indexOf(id)),
  };
}
