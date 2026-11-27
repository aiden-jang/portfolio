import { useLayoutEffect, type MouseEvent } from 'react';

type ReadingPlace = { row: string; top: number };
type WorkOrigin = { row: string; depth: number };
const pendingWork = 'portfolio:index-entry';

function plainClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function workOrigin(): WorkOrigin | undefined {
  return history.state?.workOrigin;
}

export function nextWorkState() {
  const origin = workOrigin();
  return origin ? { workOrigin: { ...origin, depth: origin.depth ? origin.depth + 1 : 0 } } : {};
}

function visit(href: string, origin: WorkOrigin) {
  const url = new URL(href, location.href);
  const ticket = crypto.randomUUID();
  url.searchParams.set('indexRow', origin.row);
  try {
    sessionStorage.setItem(pendingWork, JSON.stringify({ ticket, ...origin }));
    url.searchParams.set('visit', ticket);
  } catch {
    // The row anchor still works when tab storage is disabled.
  }
  location.assign(url.href);
}

export function openWorkRow(row: HTMLElement, href: string) {
  const id = row.dataset.workRow;
  if (!id) return;
  const place: ReadingPlace = { row: id, top: row.getBoundingClientRect().top };
  history.replaceState({ ...history.state, workIndexPlace: place }, '');
  visit(href, { row: id, depth: 1 });
}

export function followWorkRow(event: MouseEvent<HTMLAnchorElement>) {
  if (!plainClick(event)) return;
  event.preventDefault();
  openWorkRow(event.currentTarget, event.currentTarget.href);
}

export function followRelatedStory(event: MouseEvent<HTMLAnchorElement>) {
  const origin = nextWorkState().workOrigin;
  if (!origin || !plainClick(event)) return;
  event.preventDefault();
  visit(event.currentTarget.href, origin);
}

export function acceptWorkOrigin() {
  const url = new URL(location.href);
  const row = url.searchParams.get('indexRow');
  if (!row || !/^[\w-]+$/.test(row)) return;
  let depth = 0;
  try {
    const ticket = JSON.parse(sessionStorage.getItem(pendingWork) ?? 'null');
    if (ticket && ticket.ticket === url.searchParams.get('visit') && ticket.row === row) {
      depth = ticket.depth;
      sessionStorage.removeItem(pendingWork);
    }
  } catch {
    // A copied link can still return to its named row.
  }
  url.searchParams.delete('indexRow');
  url.searchParams.delete('visit');
  history.replaceState({ ...history.state, workOrigin: { row, depth } }, '', url);
}

export function indexHref() {
  const origin = workOrigin();
  return origin ? '/work/#row-' + encodeURIComponent(origin.row) : '/work/';
}

export function returnToWorkIndex() {
  const origin = workOrigin();
  if (!origin) return false;
  if (origin.depth) history.go(-origin.depth);
  else location.replace(indexHref());
  return true;
}

export function followWorkIndex(event: MouseEvent<HTMLAnchorElement>) {
  if (!plainClick(event) || !workOrigin()) return;
  event.preventDefault();
  returnToWorkIndex();
}

export function useWorkIndexReturn() {
  useLayoutEffect(() => {
    let frame = 0;
    let active = true;
    function restore() {
      const anchor = /^#row-([\w-]+)$/.exec(location.hash);
      const place = (history.state?.workIndexPlace ?? (anchor && { row: anchor[1], top: 48 })) as
        ReadingPlace | undefined;
      if (!active || !place || typeof place.row !== 'string' || !Number.isFinite(place.top)) return;
      const row = document.querySelector<HTMLElement>(
        '[data-work-row="' + CSS.escape(place.row) + '"]',
      );
      if (!row) return;
      const details = row.closest('details');
      if (details) details.open = true;
      const align = () => {
        if (!active) return;
        window.scrollBy({
          top: row.getBoundingClientRect().top - place.top,
          behavior: 'instant',
        });
        row.focus({ preventScroll: true });
      };
      align();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(align);
    }
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) restore();
    };
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    if (navigation?.type === 'back_forward' || location.hash.startsWith('#row-'))
      void document.fonts.ready.then(restore);
    window.addEventListener('pageshow', onShow);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('pageshow', onShow);
    };
  }, []);
}
