import { useLayoutEffect } from 'react';

type ReadingPlace = { row: string; top: number };
const pendingWork = 'portfolio:index-entry';

export function rememberWorkRow(row: HTMLElement) {
  const id = row.dataset.workRow;
  if (!id) return;
  const place: ReadingPlace = { row: id, top: row.getBoundingClientRect().top };
  history.replaceState({ ...history.state, workIndexPlace: place }, '');
}

export function openWorkRow(row: HTMLElement, id: string) {
  rememberWorkRow(row);
  try {
    sessionStorage.setItem(pendingWork, id);
  } catch {
    // The destination can still address the row directly.
  }
  location.assign('/?from=work#work/' + encodeURIComponent(id));
}

export function readWorkOrigin(id: string) {
  const url = new URL(location.href);
  if (url.searchParams.get('from') !== 'work') return;
  let adjacent = false;
  try {
    adjacent = sessionStorage.getItem(pendingWork) === id;
    sessionStorage.removeItem(pendingWork);
  } catch {
    // The public site omits referrers, so only the tab marker proves adjacency.
  }
  url.searchParams.delete('from');
  history.replaceState(
    { ...history.state, portfolioWorkIndex: adjacent, workIndexFallback: id },
    '',
    url,
  );
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
        const top = Math.min(innerHeight - 44, Math.max(0, place.top));
        window.scrollBy({ top: row.getBoundingClientRect().top - top, behavior: 'instant' });
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
