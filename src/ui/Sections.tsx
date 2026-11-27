import { ProjectHandoffs } from './showcase/ProjectHandoffs';
import './connected-cut.css';
import './showcase/opening/featured-globe-cut.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { caseStudyLane, isPortfolioProject } from '../data/workBrowsing';
import { WORK_ITEMS, workId } from '../data/workItems';
import { runMorph } from './morph';
import { AboutSection } from './sections/About';
import { ContactSection } from './sections/Contact';
import { ExperienceSection } from './sections/Experience';
import { IntroSection } from './sections/Intro';
import { MoreProjectsSection, WorkSection } from './sections/Work';
import { WorkModal } from './WorkModal';
import type { WorkDetail } from '../types';

export function Sections() {
  const [activeWork, setActiveWork] = useState<WorkDetail | null>(null);
  const originHash = useRef('#sec-work');
  const lastCard = useRef<HTMLElement | null>(null);
  const activeId = useRef<string | null>(null);
  const readingPosition = useRef(0);
  const restoreFrame = useRef(0);
  const restoreReading = useCallback(() => {
    cancelAnimationFrame(restoreFrame.current);
    restoreFrame.current = requestAnimationFrame(() => {
      if (activeId.current) return;
      window.scrollTo({ top: readingPosition.current, behavior: 'instant' });
      lastCard.current?.focus({ preventScroll: true });
    });
  }, []);

  // Driving the modal off the hash is what makes browser back and forward dismiss and restore it.
  useEffect(() => {
    let initial = true;
    const syncFromHash = () => {
      const match = /^#work\/(.+)$/.exec(window.location.hash);
      const item = match ? WORK_ITEMS.find((candidate) => workId(candidate) === match[1]) : null;
      if (match && !item) return;
      const first = initial;
      initial = false;
      const nextId = item ? workId(item) : null;
      // Back/Forward can report the same route through both popstate and hashchange.
      if (nextId === activeId.current) return;
      activeId.current = nextId;
      if (first && item) {
        const target = isPortfolioProject(item)
          ? document.getElementById(`project-${workId(item)}`)
          : document.getElementById('sec-experience');
        originHash.current = `#${target?.closest('section')?.id ?? 'sec-work'}`;
        target?.scrollIntoView({ block: 'start', behavior: 'instant' });
        readingPosition.current = window.scrollY;
      }
      const update = () => {
        setActiveWork(item ?? null);
        if (!item) restoreReading();
      };
      if (first) update();
      else runMorph(update, lastCard.current, !!item);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
      cancelAnimationFrame(restoreFrame.current);
    };
  }, [restoreReading]);

  const openWork = useCallback((item: WorkDetail, el: HTMLElement) => {
    const section = el.closest('section')?.id ?? 'sec-work';
    readingPosition.current = window.scrollY;
    // WebKit does not focus clicked buttons; capture the trigger before opening the dialog.
    el.focus({ preventScroll: true });
    originHash.current = window.location.hash.startsWith('#work/')
      ? isPortfolioProject(item)
        ? `#${section}`
        : '#sec-experience'
      : window.location.hash || (isPortfolioProject(item) ? `#${section}` : '#sec-experience');
    lastCard.current = el;
    activeId.current = workId(item);
    window.history.pushState({ portfolioWork: true }, '', `#work/${workId(item)}`);
    runMorph(() => setActiveWork(item), el, true);
  }, []);

  const closeWork = useCallback(() => {
    if (window.history.state?.portfolioWork) {
      window.history.back();
      return;
    }
    activeId.current = null;
    window.history.replaceState(null, '', originHash.current);
    runMorph(
      () => {
        setActiveWork(null);
        restoreReading();
      },
      lastCard.current,
      false,
    );
  }, [restoreReading]);

  const moveWork = useCallback((step: 1 | -1) => {
    setActiveWork((current) => {
      if (!current) return current;
      const lane = caseStudyLane(current, 'all');
      const currentIndex = lane.indexOf(current);
      const nextIndex = (currentIndex + step + lane.length) % lane.length;
      const next = lane[nextIndex];
      activeId.current = workId(next);
      window.history.replaceState(window.history.state, '', `#work/${workId(next)}`);
      return next;
    });
  }, []);

  const previousWork = useCallback(() => moveWork(-1), [moveWork]);
  const nextWork = useCallback(() => moveWork(1), [moveWork]);

  return (
    <main id="scroll" tabIndex={-1} className="relative z-10 outline-none">
      <IntroSection />
      <WorkSection />
      <ExperienceSection onOpen={openWork} />
      <MoreProjectsSection onOpen={openWork} />
      <AboutSection />
      <ContactSection />
      <ProjectHandoffs />
      <WorkModal
        item={activeWork}
        onClose={closeWork}
        onPrevious={previousWork}
        onNext={nextWork}
        position={
          activeWork
            ? {
                current: caseStudyLane(activeWork, 'all').indexOf(activeWork) + 1,
                total: caseStudyLane(activeWork, 'all').length,
              }
            : null
        }
      />
    </main>
  );
}
