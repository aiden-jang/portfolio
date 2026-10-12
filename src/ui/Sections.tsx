import { useCallback, useEffect, useRef, useState } from 'react';
import { caseStudyLane, isPortfolioProject, type ProjectFilter } from '../data/workBrowsing';
import { WORK_ITEMS, workId } from '../data/workItems';
import { runMorph } from './morph';
import { AboutSection } from './sections/About';
import { ContactSection } from './sections/Contact';
import { ExperienceSection } from './sections/Experience';
import { IntroSection } from './sections/Intro';
import { WorkSection } from './sections/Work';
import { WorkModal } from './WorkModal';
import type { WorkDetail } from '../types';

export function Sections() {
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [activeWork, setActiveWork] = useState<WorkDetail | null>(null);
  const originHash = useRef('#sec-work');
  const lastCard = useRef<HTMLElement | null>(null);

  // Driving the modal off the hash is what makes browser back and forward dismiss and restore it.
  useEffect(() => {
    const syncFromHash = () => {
      const match = /^#work\/(.+)$/.exec(window.location.hash);
      if (!match) {
        setActiveWork(null);
        return;
      }
      const item = WORK_ITEMS.find((candidate) => workId(candidate) === match[1]);
      if (!item) return;
      const workSection = document.getElementById('sec-work');
      if (workSection) window.scrollTo(0, workSection.offsetTop);
      setActiveWork(item);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const openWork = useCallback((item: WorkDetail, el: HTMLElement) => {
    originHash.current = window.location.hash.startsWith('#work/')
      ? isPortfolioProject(item)
        ? '#sec-work'
        : '#sec-experience'
      : window.location.hash || (isPortfolioProject(item) ? '#sec-work' : '#sec-experience');
    lastCard.current = el;
    window.history.replaceState(null, '', `#work/${workId(item)}`);
    runMorph(() => setActiveWork(item), el, true);
  }, []);

  const closeWork = useCallback(() => {
    window.history.replaceState(null, '', originHash.current);
    runMorph(() => setActiveWork(null), lastCard.current, false);
  }, []);

  const moveWork = useCallback(
    (step: 1 | -1) => {
      setActiveWork((current) => {
        if (!current) return current;
        const lane = caseStudyLane(current, filter);
        const currentIndex = lane.indexOf(current);
        const nextIndex = (currentIndex + step + lane.length) % lane.length;
        const next = lane[nextIndex];
        window.history.replaceState(null, '', `#work/${workId(next)}`);
        return next;
      });
    },
    [filter],
  );

  const previousWork = useCallback(() => moveWork(-1), [moveWork]);
  const nextWork = useCallback(() => moveWork(1), [moveWork]);

  return (
    <main id="scroll" tabIndex={-1} className="relative z-10 outline-none">
      <IntroSection />
      <ExperienceSection onOpen={openWork} />
      <WorkSection onOpen={openWork} filter={filter} onFilterChange={setFilter} />
      <AboutSection />
      <ContactSection />
      <WorkModal
        item={activeWork}
        onClose={closeWork}
        onPrevious={previousWork}
        onNext={nextWork}
        position={
          activeWork
            ? {
                current: caseStudyLane(activeWork, filter).indexOf(activeWork) + 1,
                total: caseStudyLane(activeWork, filter).length,
              }
            : null
        }
      />
    </main>
  );
}
