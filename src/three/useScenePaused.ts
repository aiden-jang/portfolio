import { useSyncExternalStore } from 'react';

function snapshot(): boolean {
  return (
    document.hidden ||
    !!document.querySelector(
      'dialog[open], [role="dialog"][aria-modal="true"]:not([aria-hidden="true"])',
    )
  );
}

function subscribe(update: () => void): () => void {
  const observer = new MutationObserver(update);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['open', 'aria-modal', 'aria-hidden'],
  });
  document.addEventListener('visibilitychange', update);
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', update);
  };
}

export function useScenePaused(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
