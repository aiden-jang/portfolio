import { lastScrollInput, prepareSectionArrival, projectArrivalAnchors } from './scrollArrival';
import { handleNavigationKey } from './navigationKeyboard';
import { useCallback, useEffect, useRef } from 'react';
import { GLOBE_CUT_VIEWPORT_FRACTION, SECTION_IDS, type SectionId } from '../config';
import { clamp } from '../math';
import { cancelSmoothScroll, sectionLanding, smoothScrollTo } from './scrollNavigation';
import { useAppStore } from '../store';
import { sectionProgress } from './sectionProgress';
import { storyAtLocation } from '../ui/creative/storyRoutes';
import {
  carIsVisibleAt,
  contactIsVisible,
  hasFullIntroView,
  pageSectionBounds,
} from '../three/orbitRegion';

function sectionAnchor(hash: string) {
  return hash.startsWith('#sill/') ? 'project-mrrp' : hash.slice(1);
}

const SNAP_LOCK_MS = 900;
// The GLB swap is async, so cycling faster than this queues loads nobody sees.
const CAR_LOCK_MS = 600;
// Below this, a mouse's horizontal jitter would cycle the car on its own.
const MIN_WHEEL_DELTA = 10;

export function useNavigation(sceneOnly = false) {
  const setSectionIndex = useAppStore((s) => s.setSectionIndex);
  const snapLockUntil = useRef(0);
  const currentSection = useRef(0);
  const carLockUntil = useRef(0);

  const cycleCarThrottled = useCallback(() => {
    const now = performance.now();
    if (now < carLockUntil.current) return;
    if (useAppStore.getState().isCarLoading || useAppStore.getState().sceneUnavailable) return;
    carLockUntil.current = now + CAR_LOCK_MS;
    useAppStore.getState().cycleCar();
  }, []);
  const prevCarThrottled = useCallback(() => {
    const now = performance.now();
    if (now < carLockUntil.current) return;
    if (useAppStore.getState().isCarLoading || useAppStore.getState().sceneUnavailable) return;
    carLockUntil.current = now + CAR_LOCK_MS;
    useAppStore.getState().prevCar();
  }, []);

  const getScrollT = useCallback((): number => {
    if (sceneOnly) return 0;
    return sectionProgress(
      window.scrollY,
      SECTION_IDS.map((id) => document.getElementById(id)?.offsetTop ?? 0),
    );
  }, [sceneOnly]);

  const goToSection = useCallback(
    (idx: number): void => {
      const next = clamp(idx, 0, SECTION_IDS.length - 1);
      currentSection.current = next;
      snapLockUntil.current = performance.now() + SNAP_LOCK_MS;
      const el = document.getElementById(SECTION_IDS[next]);
      if (!el) return;
      const targetY = sectionLanding(el);
      prepareSectionArrival(el.id);
      if (
        ['sec-work', 'sec-experience', 'sec-more-work'].includes(el.id) &&
        (matchMedia('(pointer: coarse)').matches || Math.abs(targetY - scrollY) > innerHeight * 1.6)
      ) {
        cancelSmoothScroll();
        window.scrollTo({ top: targetY, behavior: 'instant' });
      } else smoothScrollTo(targetY);
      setSectionIndex(next);
    },
    [setSectionIndex],
  );

  useEffect(() => {
    if (sceneOnly) {
      document.body.dataset.carView = 'visible';
      document.body.dataset.carControls = 'hidden';
      return () => {
        delete document.body.dataset.carView;
        delete document.body.dataset.carControls;
      };
    }
    const dialogIsOpen = () =>
      !!document.querySelector(
        'dialog[open], [role="dialog"][aria-modal="true"]:not([aria-hidden="true"])',
      );
    const stickyGlobe = window.matchMedia?.(
      '(min-height: 620px) and (prefers-reduced-motion: no-preference)',
    );
    // Clearing the lock as well as the tween is what stops the section highlight from staying
    // frozen on the jump target once the user scrolls away from it.
    const yieldToUser = () => {
      cancelSmoothScroll();
      if (!snapLockUntil.current) return;
      snapLockUntil.current = 0;
      onScroll();
    };
    const onWheel = (e: WheelEvent) => {
      if (dialogIsOpen()) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX > absY && absX >= MIN_WHEEL_DELTA) {
        if (!hasFullIntroView(window.innerHeight, pageSectionBounds())) return;
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
    let scrollFrame = 0;
    const scheduleScroll = () => {
      scrollFrame ||= requestAnimationFrame(onScroll);
    };
    const onScroll = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      const bounds = pageSectionBounds();
      const contactVisible = contactIsVisible(window.innerHeight, bounds);
      const contactView = contactVisible ? 'visible' : 'hidden';
      const dataset = document.body.dataset;
      if (dataset.contactView !== contactView) dataset.contactView = contactView;
      if (useAppStore.getState().isContactVisible !== contactVisible)
        useAppStore.getState().setContactVisible(contactVisible);
      const carControls = hasFullIntroView(window.innerHeight, bounds) ? 'visible' : 'hidden';
      const carView = carIsVisibleAt(window.innerHeight * 0.15, bounds) ? 'visible' : 'reading';
      if (dataset.carControls !== carControls) dataset.carControls = carControls;
      if (dataset.carView !== carView) dataset.carView = carView;
      if (performance.now() < snapLockUntil.current) {
        const target = bounds.find(({ id }) => id === SECTION_IDS[currentSection.current]);
        if (!target || Math.abs(target.top) > 2) return;
      }
      snapLockUntil.current = 0;
      const idx = bounds.reduce((active, { id, top }) => {
        const atGlobeCut =
          id === 'sec-work' &&
          stickyGlobe?.matches &&
          document.documentElement.hasAttribute('data-featured-globe-cut');
        const threshold = atGlobeCut ? GLOBE_CUT_VIEWPORT_FRACTION : 0.15;
        return top <= innerHeight * threshold ? SECTION_IDS.indexOf(id as SectionId) : active;
      }, 0);
      currentSection.current = idx;
      if (useAppStore.getState().sectionIndex !== idx) setSectionIndex(idx);
    };

    const restoreSectionLink = (event?: HashChangeEvent) => {
      // Readers restore their own scroll position when closed through history.
      if (event?.oldURL) {
        const from = new URL(event.oldURL);
        if (/^#(?:work|quake)\//.test(from.hash) || storyAtLocation(from)) return;
      }
      const anchor = sectionAnchor(location.hash);
      const index = SECTION_IDS.indexOf(anchor as SectionId);
      if (index < 0) {
        if (projectArrivalAnchors.includes(anchor)) {
          cancelSmoothScroll();
          prepareSectionArrival(anchor);
          document.getElementById(anchor)?.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
        return;
      }
      const section = document.getElementById(SECTION_IDS[index]);
      if (!section) return;
      cancelSmoothScroll();
      snapLockUntil.current = 0;
      prepareSectionArrival(section.id);
      window.scrollTo({
        top:
          section.id === 'sec-more-work' || section.id === 'sec-experience'
            ? sectionLanding(section)
            : section.offsetTop,
        behavior: 'instant',
      });
      currentSection.current = index;
      setSectionIndex(index);
    };
    const rememberCase = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !storyAtLocation(url)) return;
      history.replaceState(
        {
          ...history.state,
          portfolioCaseReturn: { y: scrollY, href: link.href },
        },
        '',
      );
    };
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    const bookmark =
      navigation?.type === 'back_forward'
        ? (history.state?.portfolioCaseReturn as { y: number; href: string } | undefined)
        : undefined;
    const restoreCaseReturn = () => {
      if (!bookmark || !Number.isFinite(bookmark.y)) return false;
      window.scrollTo({ top: bookmark.y, behavior: 'instant' });
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('main a'));
      const destination = new URL(bookmark.href, location.href);
      const sameCase = (link: HTMLAnchorElement) =>
        link.pathname === destination.pathname &&
        new URL(link.href).searchParams.get('story') === destination.searchParams.get('story');
      const trigger = links.find((link) => link.href === bookmark.href) ?? links.find(sameCase);
      trigger?.focus({ preventScroll: true });
      return true;
    };
    let active = true;
    const initialHash = location.hash;
    const initialInput = lastScrollInput();
    let initialLanding: number | undefined;
    const linkFrame = requestAnimationFrame(() => {
      if (!restoreCaseReturn()) {
        restoreSectionLink();
        const anchor = sectionAnchor(initialHash);
        if (SECTION_IDS.includes(anchor as SectionId) || projectArrivalAnchors.includes(anchor)) {
          initialLanding = window.scrollY;
        }
      }
      onScroll();
    });
    void document.fonts?.ready.then(() => {
      if (active) {
        restoreCaseReturn();
        onScroll();
      }
    });
    onScroll();
    // WebKit can reflow after fonts.ready without a scroll event.
    const layoutObserver = new ResizeObserver(() => {
      if (initialLanding !== undefined) {
        if (
          location.hash !== initialHash ||
          window.scrollY !== initialLanding ||
          lastScrollInput() !== initialInput
        ) {
          initialLanding = undefined;
        } else {
          restoreSectionLink();
          initialLanding = window.scrollY;
        }
      }
      onScroll();
    });
    for (const id of SECTION_IDS) {
      const section = document.getElementById(id);
      if (section) layoutObserver.observe(section);
    }
    document.addEventListener('click', rememberCase);
    window.addEventListener('hashchange', restoreSectionLink);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      active = false;
      cancelAnimationFrame(linkFrame);
      cancelAnimationFrame(scrollFrame);
      cancelSmoothScroll();
      layoutObserver.disconnect();
      document.removeEventListener('click', rememberCase);
      window.removeEventListener('hashchange', restoreSectionLink);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sceneOnly, getScrollT, goToSection, setSectionIndex, cycleCarThrottled, prevCarThrottled]);

  return {
    goToSection,
    getScrollT,
    scrollToSection: (id: SectionId) => goToSection(SECTION_IDS.indexOf(id)),
  };
}
