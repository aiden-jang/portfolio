import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { AboutSection } from './sections/About';
import { ContactSection } from './sections/Contact';
import { ExperienceSection } from './sections/Experience';
import { IntroSection } from './sections/Intro';
import { WorkSection } from './sections/Work';
import { WorkModal, type WorkDetail } from './WorkModal';

type StartViewTransition = (cb: () => void) => { finished: Promise<void> };

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
    vt.finished.catch(() => {}).finally(() => {
      if (el) el.style.viewTransitionName = '';
    });
  }, []);

  const openWork = useCallback(
    (item: WorkDetail, el: HTMLElement) => {
      lastCard.current = el;
      runMorph(() => setActiveWork(item), el, true);
    },
    [runMorph],
  );

  const closeWork = useCallback(() => {
    runMorph(() => setActiveWork(null), lastCard.current, false);
  }, [runMorph]);

  return (
    <main id="scroll" tabIndex={-1} className="relative z-10 outline-none">
      <IntroSection />
      <ExperienceSection onOpen={openWork} />
      <WorkSection onOpen={openWork} />
      <AboutSection />
      <ContactSection />
      <WorkModal item={activeWork} onClose={closeWork} />
    </main>
  );
}
