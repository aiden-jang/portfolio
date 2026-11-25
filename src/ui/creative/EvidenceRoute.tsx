import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { App } from '../../App';
import { StoryPage } from './StoryPage';
import { OpenEvidence } from './evidenceNavigation';
import { type StoryId } from './storyRoutes';
import './iodine-route.css';

function animateRoute(update: () => void) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
    update();
    return;
  }
  const transition = document.startViewTransition(update);
  void transition.ready.catch(() => {});
}

export function EvidenceRoute() {
  const [open, setOpen] = useState<StoryId | null>(null);
  const active = useRef<StoryId | null>(null);
  const restoreFrame = useRef(0);
  const origin = useRef<{
    scrollY: number;
    link: HTMLAnchorElement;
    title: string;
    restoration: ScrollRestoration;
  } | null>(null);

  const show = (value: StoryId | null) => {
    if (active.current === value) return;
    active.current = value;
    cancelAnimationFrame(restoreFrame.current);
    history.scrollRestoration = 'manual';
    animateRoute(() => {
      flushSync(() => setOpen(value));
      if (value) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document
          .querySelector<HTMLElement>('.creative-case-heading h1')
          ?.focus({ preventScroll: true });
      } else if (origin.current) {
        const bookmark = origin.current;
        window.scrollTo({ top: bookmark.scrollY, behavior: 'instant' });
        restoreFrame.current = requestAnimationFrame(() => {
          if (active.current) return;
          window.scrollTo({ top: bookmark.scrollY, behavior: 'instant' });
          bookmark.link.focus({ preventScroll: true });
          document.title = bookmark.title;
          history.scrollRestoration = bookmark.restoration;
        });
      }
    });
  };

  useEffect(() => {
    const traverse = () =>
      show(history.state?.portfolioEvidence ?? (history.state?.iodineCase ? 'iodine' : null));
    window.addEventListener('popstate', traverse);
    return () => {
      window.removeEventListener('popstate', traverse);
      cancelAnimationFrame(restoreFrame.current);
    };
  }, []);

  const enter = (event: MouseEvent<HTMLAnchorElement>, id: StoryId) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return false;
    event.preventDefault();
    origin.current = {
      link: event.currentTarget,
      scrollY: window.scrollY,
      title: document.title,
      restoration: history.scrollRestoration,
    };
    history.pushState({ portfolioEvidence: id }, '', event.currentTarget.href);
    show(id);
    return true;
  };

  return (
    <OpenEvidence.Provider value={enter}>
      <div hidden={Boolean(open)} className="evidence-portfolio">
        <App />
      </div>
      {open && <StoryPage key={open} id={open} returnToPortfolio={() => history.back()} />}
    </OpenEvidence.Provider>
  );
}
