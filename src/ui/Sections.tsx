import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { WORK_ITEMS } from '../data/workItems';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { AboutSection } from './sections/About';
import { ContactSection } from './sections/Contact';
import { ExperienceSection } from './sections/Experience';
import { IntroSection } from './sections/Intro';
import { WorkSection } from './sections/Work';
import { workId, WorkModal, type WorkDetail } from './WorkModal';

type StartViewTransition = (cb: () => void) => { finished: Promise<void> };

/** Keep project and professional case studies in their own browse lanes. A
 * visitor opening a side project should not unexpectedly land in a job entry
 * when they hit next. */
function caseStudyLane(item: WorkDetail): WorkDetail[] {
  return WORK_ITEMS.filter((candidate) => Boolean(candidate.mark) === Boolean(item.mark));
}

/** Top-level page layout: the five scroll sections, plus the WorkModal that any
 *  work card/row opens. Opening and closing morph the clicked card into the
 *  modal (and back) via the View Transitions API — the shared `work-morph`
 *  name is placed on the card for the "before" snapshot and on the modal for
 *  the "after", so the browser tweens between them. Feature-detected and
 *  reduced-motion aware; without support it falls back to the modal's own CSS
 *  transition. See the ::view-transition rules in index.css. */
export function Sections() {
  const [activeWork, setActiveWork] = useState<WorkDetail | null>(null);
  // The card element most recently used to open the modal, so a close morphs
  // back into the same card.
  const lastCard = useRef<HTMLElement | null>(null);

  // A case study gets a real URL (`#work/iguess`), so it is useful in a
  // recruiter handoff or a message—not just discoverable from the home page.
  // Hash changes also make browser back/forward dismiss or restore the modal.
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

  const runMorph = useCallback((update: () => void, el: HTMLElement | null, opening: boolean) => {
    const start = (document as Document & { startViewTransition?: StartViewTransition })
      .startViewTransition;
    if (!start || prefersReducedMotion()) {
      update();
      return;
    }
    // Opening: name the card now so it's in the "before" snapshot.
    if (opening && el) el.style.viewTransitionName = 'work-morph';
    const vt = start.call(document, () => {
      flushSync(update);
      // After the DOM update, the modal carries the name; hand it to the card
      // only for the closing direction so the morph target is the card.
      if (el) el.style.viewTransitionName = opening ? '' : 'work-morph';
    });
    vt.finished
      .catch(() => {})
      .finally(() => {
        if (el) el.style.viewTransitionName = '';
      });
  }, []);

  const openWork = useCallback(
    (item: WorkDetail, el: HTMLElement) => {
      lastCard.current = el;
      window.history.replaceState(null, '', `#work/${workId(item)}`);
      runMorph(() => setActiveWork(item), el, true);
    },
    [runMorph],
  );

  const closeWork = useCallback(() => {
    window.history.replaceState(null, '', '#sec-work');
    runMorph(() => setActiveWork(null), lastCard.current, false);
  }, [runMorph]);

  const moveWork = useCallback((step: 1 | -1) => {
    setActiveWork((current) => {
      if (!current) return current;
      const lane = caseStudyLane(current);
      const currentIndex = lane.indexOf(current);
      const nextIndex = (currentIndex + step + lane.length) % lane.length;
      const next = lane[nextIndex];
      window.history.replaceState(null, '', `#work/${workId(next)}`);
      return next;
    });
  }, []);

  const previousWork = useCallback(() => moveWork(-1), [moveWork]);
  const nextWork = useCallback(() => moveWork(1), [moveWork]);

  return (
    <main id="scroll" tabIndex={-1} className="relative z-10 outline-none">
      <IntroSection />
      <ExperienceSection onOpen={openWork} />
      <WorkSection onOpen={openWork} />
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
                current: caseStudyLane(activeWork).indexOf(activeWork) + 1,
                total: caseStudyLane(activeWork).length,
              }
            : null
        }
      />
    </main>
  );
}
