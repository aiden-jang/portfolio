import { handleNavigationKey } from './navigationKeyboard';
import { useCallback, useEffect, useRef } from 'react';
import { SECTION_IDS, type SectionId } from '../config';
import { clamp } from '../math';
import { cancelSmoothScroll, smoothScrollTo } from './scrollNavigation';
import { useAppStore } from '../store';
import { sectionProgress } from './sectionProgress';
import {
  canOrbitAt,
  contactIsVisible,
  hasFullCarView,
  pageSectionBounds,
} from '../three/orbitRegion';

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
    return sectionProgress(
      window.scrollY,
      SECTION_IDS.map((id) => document.getElementById(id)?.offsetTop ?? 0),
    );
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
      !!document.querySelector(
        'dialog[open], [role="dialog"][aria-modal="true"]:not([aria-hidden="true"])',
      );
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
      handleNavigationKey(e, currentSection.current, {
        goToSection,
        nextCar: cycleCarThrottled,
        previousCar: prevCarThrottled,
      });
    };
    const onScroll = () => {
      const bounds = pageSectionBounds();
      const contactVisible = contactIsVisible(window.innerHeight, bounds);
      document.body.dataset.contactView = contactVisible ? 'visible' : 'hidden';
      if (useAppStore.getState().isContactVisible !== contactVisible)
        useAppStore.getState().setContactVisible(contactVisible);
      document.body.dataset.carControls = hasFullCarView(window.innerHeight, bounds)
        ? 'visible'
        : 'hidden';
      document.body.dataset.carView = canOrbitAt(window.innerHeight * 0.15, bounds)
        ? 'visible'
        : 'reading';
      if (performance.now() < snapLockUntil.current) return;
      const idx = SECTION_IDS.reduce((active, id, index) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= window.innerHeight * 0.15
          ? index
          : active;
      }, 0);
      currentSection.current = idx;
      setSectionIndex(idx);
    };

    const restoreSectionLink = () => {
      const index = SECTION_IDS.indexOf(window.location.hash.slice(1) as SectionId);
      if (index < 0) return;
      const section = document.getElementById(SECTION_IDS[index]);
      if (!section) return;
      cancelSmoothScroll();
      window.scrollTo({ top: section.offsetTop, behavior: 'instant' });
      currentSection.current = index;
      setSectionIndex(index);
    };
    const linkFrame = requestAnimationFrame(restoreSectionLink);
    onScroll();
    window.addEventListener('hashchange', restoreSectionLink);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(linkFrame);
      window.removeEventListener('hashchange', restoreSectionLink);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [getScrollT, goToSection, setSectionIndex, cycleCarThrottled, prevCarThrottled]);

  return {
    goToSection,
    getScrollT,
    scrollToSection: (id: SectionId) => goToSection(SECTION_IDS.indexOf(id)),
  };
}
