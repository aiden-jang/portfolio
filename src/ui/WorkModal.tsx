import { useDialogFocus } from './useDialogFocus';
import { usePageScrollLock } from './usePageScrollLock';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { WorkDetail } from '../types';
import { WorkModalLinks } from './WorkModalLinks';
import { WorkModalNav } from './WorkModalNav';
import { WorkStory } from './WorkStory';
import { ScrollBody } from './ScrollBody';
import { dismissStoryActions } from './dismissStoryActions';
import './work-modal.css';
type Props = {
  item: WorkDetail | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  position: { current: number; total: number } | null;
};
export function WorkModal({ item, onClose, onPrevious, onNext, position }: Props) {
  const open = !!item;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const panel = dialogRef.current;
    if (!open || !panel || document.documentElement.dataset.workTransition) return;
    // Native morph snapshots need a fully visible target; other entries use the shared fade.
    panel.classList.add('dialog-panel');
    panel.parentElement?.classList.add('dialog-overlay');
  }, [open]);
  useDialogFocus(open, dialogRef, closeRef);
  usePageScrollLock(open);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !dismissStoryActions(dialogRef.current)) onClose();
      if (
        e.key.startsWith('Arrow') &&
        (e.target as HTMLElement)?.closest('summary, input, textarea, select')
      )
        return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevious();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    const body = document.body;
    body.classList.add('modal-open');
    return () => {
      window.removeEventListener('keydown', onKey);
      body.classList.remove('modal-open');
    };
  }, [onClose, onNext, onPrevious, open]);
  if (!item) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-modal-title"
      onClick={onClose}
      className="work-modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4 py-4 bg-[rgba(5,5,13,0.9)]"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const touch = event.changedTouches[0];
          touchStart.current = null;
          if (!start || !touch) return;
          const deltaX = touch.clientX - start.x;
          const deltaY = touch.clientY - start.y;
          if (Math.abs(deltaX) < 56 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
          if (deltaX > 0) onPrevious();
          else onNext();
        }}
        style={{ viewTransitionName: 'work-morph' }}
        className="work-modal-panel relative flex flex-col w-full max-w-[960px] max-h-[85dvh] overflow-hidden bg-[#0a0a14] border border-[var(--color-line)] rounded-xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="work-modal-close"
        >
          ×
        </button>
        <>
          <ScrollBody key={item.title} storyId={item.title}>
            <span data-nosnippet className="sr-only">
              {item.context}
            </span>
            <h3 id="work-modal-title" className="work-modal-title">
              {item.displayTitle ?? item.title}
            </h3>
            <p className="mt-2 mb-5 text-[rgba(244,240,255,0.6)] text-[0.95rem] leading-[1.5]">
              {item.summary}
            </p>
            <WorkStory item={item} />
            <p className="work-technologies">{item.stack.join(' · ')}</p>
          </ScrollBody>
          <div className="work-modal-footer">
            <WorkModalNav {...{ onPrevious, onNext, position }} />
            <WorkModalLinks key={item.title} item={item} />
          </div>
        </>
      </div>
    </div>,
    document.body,
  );
}
