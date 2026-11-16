import { useEffect, useLayoutEffect, useRef, type TouchEvent } from 'react';
import type { WorkDetail } from '../types';
import { useDialogFocus } from './useDialogFocus';
import { usePageScrollLock } from './usePageScrollLock';
import { dismissStoryActions } from './dismissStoryActions';

export function useWorkDialog(
  item: WorkDetail | null,
  actions: { onClose: () => void; onPrevious: () => void; onNext: () => void },
) {
  const { onClose, onPrevious, onNext } = actions;
  const open = !!item;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useDialogFocus(open, dialogRef, closeRef);
  usePageScrollLock(open);
  useLayoutEffect(() => {
    const panel = dialogRef.current;
    if (!open || !panel || document.documentElement.dataset.workTransition) return;
    // Morph snapshots need a visible target; other entries use the shared fade.
    panel.classList.add('dialog-panel');
    panel.parentElement?.classList.add('dialog-overlay');
  }, [open]);
  useEffect(() => {
    if (!item) return;
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = `${item.shortName ?? item.displayTitle ?? item.title} | Aiden Jang`;
    if (description) description.content = item.summary;
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined)
        description.content = previousDescription;
    };
  }, [item]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !dismissStoryActions(dialogRef.current)) onClose();
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest('summary, input, textarea, select')
      )
        return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (event.key === 'ArrowLeft') onPrevious();
        else onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [onClose, onNext, onPrevious, open]);
  return {
    dialogRef,
    closeRef,
    onTouchStart(event: TouchEvent) {
      if (event.target instanceof Element && event.target.closest('dialog')) {
        touchStart.current = null;
        return;
      }
      const touch = event.touches[0];
      if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd(event: TouchEvent) {
      const start = touchStart.current;
      const touch = event.changedTouches[0];
      touchStart.current = null;
      if (!start || !touch) return;
      const x = touch.clientX - start.x;
      const y = touch.clientY - start.y;
      if (Math.abs(x) < 56 || Math.abs(x) <= Math.abs(y)) return;
      if (x > 0) onPrevious();
      else onNext();
    },
  };
}
