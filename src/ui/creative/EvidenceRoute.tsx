import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { App } from '../../App';
import { StoryPage } from './StoryPage';
import { OpenEvidence, type EvidenceFrame, type OpenEvidenceLink } from './evidenceNavigation';
import { type StoryId } from './storyRoutes';
import './iodine-route.css';

export function EvidenceRoute() {
  const [open, setOpen] = useState<StoryId | null>(null);
  const active = useRef<StoryId | null>(null);
  const restoreFrame = useRef(0);
  const routeToken = useRef<symbol>();
  const transition = useRef<ViewTransition | null>(null);
  const origin = useRef<{
    scrollY: number;
    link: HTMLAnchorElement;
    title: string;
    restoration: ScrollRestoration;
    frame?: EvidenceFrame;
  } | null>(null);

  const show = (value: StoryId | null) => {
    if (active.current === value) return;
    active.current = value;
    const token = Symbol();
    routeToken.current = token;
    const previous = transition.current;
    previous?.skipTransition();
    transition.current = null;
    cancelAnimationFrame(restoreFrame.current);
    history.scrollRestoration = 'manual';
    const bookmark = origin.current;
    const restoreFocus = () => {
      if (!bookmark || token !== routeToken.current) return;
      restoreFrame.current = requestAnimationFrame(() => {
        if (token !== routeToken.current) return;
        window.scrollTo({ top: bookmark.scrollY, behavior: 'instant' });
        bookmark.link.focus({ preventScroll: true });
        document.title = bookmark.title;
        history.scrollRestoration = bookmark.restoration;
      });
    };
    const update = () => {
      if (token !== routeToken.current) return;
      flushSync(() => setOpen(value));
      if (value) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document
          .querySelector<HTMLElement>('.creative-case-heading h1')
          ?.focus({ preventScroll: true });
      } else if (bookmark) {
        window.scrollTo({ top: bookmark.scrollY, behavior: 'instant' });
      }
    };
    if (
      previous ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !document.startViewTransition
    ) {
      update();
      if (!value) restoreFocus();
      return;
    }
    const animation = document.startViewTransition(update);
    transition.current = animation;
    void animation.ready.catch(() => {});
    // WebKit can still suppress focus while the outgoing case snapshot is on screen.
    const finish = () => {
      if (transition.current === animation) transition.current = null;
      if (!value) restoreFocus();
    };
    void animation.finished.then(finish, finish);
  };

  useEffect(() => {
    const traverse = () =>
      show(history.state?.portfolioEvidence ?? (history.state?.iodineCase ? 'iodine' : null));
    window.addEventListener('popstate', traverse);
    return () => {
      window.removeEventListener('popstate', traverse);
      routeToken.current = undefined;
      transition.current?.skipTransition();
      cancelAnimationFrame(restoreFrame.current);
    };
  }, []);

  const enter: OpenEvidenceLink = (event, id, capture) => {
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
    origin.current?.frame?.source.removeAttribute('data-evidence-frame');
    const frame = capture?.();
    frame?.source.setAttribute('data-evidence-frame', '');
    origin.current = {
      link: event.currentTarget,
      scrollY: window.scrollY,
      title: document.title,
      restoration: history.scrollRestoration,
      frame,
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
      {open && (
        <StoryPage
          key={open}
          id={open}
          frame={origin.current?.frame}
          returnToPortfolio={() => history.back()}
        />
      )}
    </OpenEvidence.Provider>
  );
}
