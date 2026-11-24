import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { App } from '../../App';
import { StoryPage } from './StoryPage';
import { evidenceHref } from './storyRoutes';
import { OpenIodine } from '../showcase/iodine-session';
import './iodine-route.css';

function animateRoute(update: () => void) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
    update();
    return;
  }
  const transition = document.startViewTransition(update);
  void transition.ready.catch(() => {});
}

export function IodineRoute() {
  const [open, setOpen] = useState(false);
  const active = useRef(false);
  const restoreFrame = useRef(0);
  const origin = useRef<{
    scrollY: number;
    link: HTMLAnchorElement;
    title: string;
    restoration: ScrollRestoration;
  } | null>(null);

  const show = (value: boolean) => {
    if (active.current === value) return;
    active.current = value;
    cancelAnimationFrame(restoreFrame.current);
    history.scrollRestoration = 'manual';
    animateRoute(() => {
      flushSync(() => setOpen(value));
      if (value) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document
          .querySelector<HTMLElement>('.iodine-case-heading h1')
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
    const traverse = () => show(history.state?.iodineCase === true);
    window.addEventListener('popstate', traverse);
    return () => {
      window.removeEventListener('popstate', traverse);
      cancelAnimationFrame(restoreFrame.current);
    };
  }, []);

  const enter = (event: MouseEvent<HTMLAnchorElement>, restored: boolean) => {
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
    history.pushState(
      { iodineCase: true },
      '',
      evidenceHref('iodine', {
        edit: restored ? 'restored' : 'edited',
      }),
    );
    show(true);
    return true;
  };

  return (
    <OpenIodine.Provider value={enter}>
      <div hidden={open} className="iodine-portfolio">
        <App />
      </div>
      {open && <StoryPage id="iodine" returnToPortfolio={() => history.back()} />}
    </OpenIodine.Provider>
  );
}
