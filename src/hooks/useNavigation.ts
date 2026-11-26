import { lastScrollInput, prepareSectionArrival, projectArrivalAnchors } from './scrollArrival';
import { handleNavigationKey } from './navigationKeyboard';
import { useCallback, useEffect, useRef } from 'react';
import { SECTION_IDS, type SectionId } from '../config';
import { clamp } from '../math';
import { cancelSmoothScroll, smoothScrollTo } from './scrollNavigation';
import { useAppStore } from '../store';
import { sectionProgress } from './sectionProgress';
import { storyAtLocation } from '../ui/creative/storyRoutes';
import {
  carIsVisibleAt,
  contactIsVisible,
  hasFullIntroView,
  pageSectionBounds,
} from '../three/orbitRegion';

const SNAP_LOCK_MS = 900;
// The GLB swap is async, so cycling faster than this queues loads nobody sees.
const CAR_LOCK_MS = 600;
// Below this, a mouse's horizontal jitter would cycle the car on its own.
const MIN_WHEEL_DELTA = 10;
function sectionLanding(section: HTMLElement) {
  if (section.id === 'sec-more-work') {
    const heading = section.querySelector(
      '.bloom-garden-inner:not([hidden]) #bloom-garden-title, .bloom-draft:not([hidden]) #bloom-draft-title',
    );
    const header = document.querySelector('.portfolio-header');
    if (heading) {
      return (
        heading.getBoundingClientRect().top +
        scrollY -
        (header?.getBoundingClientRect().height ?? 0) -
        14
      );
    }
  }
  return section.getBoundingClientRect().top + scrollY;
}

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
    const onScroll = () => {
      const bounds = pageSectionBounds();
      const contactVisible = contactIsVisible(window.innerHeight, bounds);
      document.body.dataset.contactView = contactVisible ? 'visible' : 'hidden';
      if (useAppStore.getState().isContactVisible !== contactVisible)
        useAppStore.getState().setContactVisible(contactVisible);
      document.body.dataset.carControls = hasFullIntroView(window.innerHeight, bounds)
        ? 'visible'
        : 'hidden';
      document.body.dataset.carView = carIsVisibleAt(window.innerHeight * 0.15, bounds)
        ? 'visible'
        : 'reading';
      if (performance.now() < snapLockUntil.current) {
        const target = bounds.find(({ id }) => id === SECTION_IDS[currentSection.current]);
        if (!target || Math.abs(target.top) > 2) return;
      }
      snapLockUntil.current = 0;
      const idx = SECTION_IDS.reduce((active, id, index) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= window.innerHeight * 0.15
          ? index
          : active;
      }, 0);
      currentSection.current = idx;
      setSectionIndex(idx);
    };

    const restoreSectionLink = (event?: HashChangeEvent) => {
      // Readers restore their own scroll position when closed through history.
      if (event?.oldURL) {
        const from = new URL(event.oldURL);
        if (/^#(?:work|quake)\//.test(from.hash) || storyAtLocation(from)) return;
      }
      const anchor = location.hash.slice(1);
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
        top: section.id === 'sec-more-work' ? sectionLanding(section) : section.offsetTop,
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
    const refreshLayout = () => {
      if (active) onScroll();
    };
    const initialHash = location.hash;
    const initialInput = lastScrollInput();
    let initialLanding: number | undefined;
    const linkFrame = requestAnimationFrame(() => {
      if (!restoreCaseReturn()) {
        restoreSectionLink();
        const anchor = initialHash.slice(1);
        if (SECTION_IDS.includes(anchor as SectionId) || projectArrivalAnchors.includes(anchor)) {
          initialLanding = window.scrollY;
        }
      }
      refreshLayout();
    });
    void document.fonts?.ready.then(() => {
      if (active) {
        restoreCaseReturn();
        refreshLayout();
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
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      active = false;
      cancelAnimationFrame(linkFrame);
      cancelSmoothScroll();
      layoutObserver.disconnect();
      document.removeEventListener('click', rememberCase);
      window.removeEventListener('hashchange', restoreSectionLink);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sceneOnly, getScrollT, goToSection, setSectionIndex, cycleCarThrottled, prevCarThrottled]);

  return {
    goToSection,
    getScrollT,
    scrollToSection: (id: SectionId) => goToSection(SECTION_IDS.indexOf(id)),
  };
}
