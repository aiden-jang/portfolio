import { useDialogFocus } from './useDialogFocus';
import { usePageScrollLock } from './usePageScrollLock';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { WorkDetail } from '../types';
import { WorkModalLinks } from './WorkModalLinks';
import { WorkModalNav } from './WorkModalNav';
import { WorkStory } from './WorkStory';
import { ScrollBody } from './ScrollBody';
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
      if (e.key === 'Escape') onClose();
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
  if (!open) return null;
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
          className="
            absolute top-2.5 right-2.5 z-10 w-11 h-11 md:w-9 md:h-9 rounded-full cursor-pointer
            border border-[var(--color-line)] bg-[#0a0a14]
            text-[var(--color-muted)] text-xl leading-none
            hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]
            transition-colors
          "
        >
          ×
        </button>
        {item && (
          <>
            <ScrollBody key={item.title} storyId={item.title}>
              {item.image && (
                <WorkBanner key={item.image} src={item.image} alt={`${item.title} screenshot`} />
              )}
              <Eyebrow>{item.context}</Eyebrow>
              <h3
                id="work-modal-title"
                className="mt-3 mb-1 text-[clamp(1.6rem,3.2vw,2.2rem)] leading-[1.05] font-semibold tracking-[-0.03em]"
              >
                {item.displayTitle ?? item.title}
              </h3>
              <p className="mt-2 mb-5 text-[rgba(244,240,255,0.6)] text-[0.95rem] leading-[1.5]">
                {item.summary}
              </p>
              <WorkStory item={item} />
              <p className="work-technologies">{item.stack.join(' · ')}</p>
            </ScrollBody>
            <div className="work-modal-footer">
              <WorkModalNav {...{ item, onPrevious, onNext, position }} />
              <WorkModalLinks item={item} />
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-[var(--font-mono)] text-[0.66rem] tracking-[0.36em] uppercase text-[var(--color-muted)]">
      <span data-nosnippet>{children}</span>
    </span>
  );
}
/** The negative margins have to match the panel's own `p-5` / `p-7` padding to bleed cleanly. */
function WorkBanner({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="-mx-5 -mt-5 md:-mx-7 md:-mt-6 mb-5 border-b border-[var(--color-line)] overflow-hidden">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="block w-full h-auto max-h-[300px] object-cover object-top"
      />
    </div>
  );
}
