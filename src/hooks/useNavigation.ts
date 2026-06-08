import { useCallback, useEffect, useRef } from 'react';
import { SECTION_IDS, type SectionId } from '../config';
import { clamp } from '../math';
import { useAppStore } from '../store';

const SNAP_LOCK_MS = 1100;
/** Wheel events with |deltaY| below this are treated as trackpad-inertia tail
 *  and ignored. Real user-initiated scrolls have deltaY >> this. */
const MIN_WHEEL_DELTA = 10;

/** Wheel/keyboard-hijacked section navigation. Each wheel tick or arrow key
 *  commits to moving exactly one section; nav-link clicks jump directly.
 *  Exposes `getScrollT` for the camera rig to interpolate keyframes by. */
export function useNavigation() {
  const setSectionIndex = useAppStore((s) => s.setSectionIndex);
  const snapLockUntil = useRef(0);
  const currentSection = useRef(0);

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
      e.preventDefault();
      // Drop trackpad inertia-tail events (tiny deltas).
      if (Math.abs(e.deltaY) < MIN_WHEEL_DELTA) return;
      if (performance.now() < snapLockUntil.current) return;
      if (e.deltaY > 0) goToSection(currentSection.current + 1);
      else if (e.deltaY < 0) goToSection(currentSection.current - 1);
    };
    const onKey = (e: KeyboardEvent) => {
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
        case 'Home':
          e.preventDefault();
          goToSection(0);
          break;
        case 'End':
          e.preventDefault();
          goToSection(SECTION_IDS.length - 1);
          break;
      }
    };
    const onScroll = () => {
      const t = getScrollT() * (SECTION_IDS.length - 1);
      const idx = Math.round(t);
      if (performance.now() >= snapLockUntil.current) {
        currentSection.current = idx;
        setSectionIndex(idx);
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [getScrollT, goToSection, setSectionIndex]);

  return { goToSection, getScrollT, scrollToSection: (id: SectionId) => goToSection(SECTION_IDS.indexOf(id)) };
}
