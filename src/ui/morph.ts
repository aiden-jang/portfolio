import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type StartViewTransition = (callback: () => void) => ViewTransition;

const MORPH_NAME = 'work-morph';

/** Morphs the clicked card into the modal and back, falling through to a plain update. */
export function runMorph(update: () => void, el: HTMLElement | null, opening: boolean): void {
  const start = (document as Document & { startViewTransition?: StartViewTransition })
    .startViewTransition;
  if (!start || prefersReducedMotion()) {
    update();
    return;
  }
  // The name has to land on the card before the transition starts, to be in its snapshot.
  if (opening && el) el.style.viewTransitionName = MORPH_NAME;
  const transition = start.call(document, () => {
    flushSync(update);
    // Only one element may hold the name at a time, so it moves to whichever side the
    // transition is heading toward.
    if (el) el.style.viewTransitionName = opening ? '' : MORPH_NAME;
  });
  // Opening a second case study supersedes this transition, and `ready` rejects. That is a
  // skipped animation rather than a failure, so swallow it: `finished` still settles and the
  // cleanup below still runs. Leaving it unhandled logs an InvalidStateError on every fast
  // open-close.
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (el) el.style.viewTransitionName = '';
    });
}
