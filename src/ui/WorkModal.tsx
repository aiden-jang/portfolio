import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { WorkDetail } from '../types';
import { WorkModalLinks } from './WorkModalLinks';
import { WorkModalNav } from './WorkModalNav';

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
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Social crawlers only ever get the static preview, so this is for the person with ten tabs
  // open trying to find the case study again.
  useEffect(() => {
    if (!item) return;
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = `${item.shortName ?? item.title} | Aiden Jang`;
    if (description) description.content = item.summary;
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined)
        description.content = previousDescription;
    };
  }, [item]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevious();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    // <html> is the scroll root (see index.css), so `overflow: hidden` on the body does not stop
    // the page behind the modal, and iOS ignores overflow locks anyway. Pin the body instead.
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    // The class is what lets CSS hide the mobile bottom bar, which otherwise overlaps the modal.
    body.classList.add('modal-open');

    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.classList.remove('modal-open');
      window.scrollTo(0, scrollY);
      // A direct `#work/...` link has no originating card, so the old element may be gone.
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [onClose, onNext, onPrevious, open]);

  // Portal to <body>. Inline, the overlay's z-50 is scoped inside `<main class="z-10">`, which
  // leaves it under the z-30 mobile bottom bar, whose invisible buttons then swallow link taps.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-modal-title"
      aria-hidden={!open}
      onClick={onClose}
      className={`
        fixed inset-0 z-50 flex items-center justify-center px-4 py-4
        bg-[rgba(5,5,13,0.9)]
        transition-opacity duration-200
        ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
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
        style={open ? { viewTransitionName: 'work-morph' } : undefined}
        className={`
          relative flex flex-col w-full max-w-[640px] max-h-[85dvh] overflow-hidden
          bg-[#0a0a14] border border-[var(--color-line)] rounded-xl
          transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
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
            {/* overscroll-contain stops the scroll chaining to the page behind at either end. */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 pt-5 md:p-7 md:pt-6">
              {item.image && (
                <WorkBanner key={item.image} src={item.image} alt={`${item.title} screenshot`} />
              )}
              <Eyebrow>{item.context}</Eyebrow>
              <h3
                id="work-modal-title"
                className="mt-3 mb-1 text-[clamp(1.6rem,3.2vw,2.2rem)] leading-[1.05] font-semibold tracking-[-0.03em]"
              >
                {item.title}
              </h3>
              <p className="mt-2 mb-5 text-[rgba(244,240,255,0.6)] text-[0.95rem] leading-[1.5]">
                {item.summary}
              </p>
              {(item.moment || item.principle) && (
                <aside className="mb-5 rounded-xl border border-white/[0.1] bg-white/[0.035] p-4">
                  {item.moment && (
                    <p className="font-[var(--font-mono)] text-[0.62rem] tracking-[0.18em] uppercase text-[var(--color-neon)]">
                      The point · {item.moment}
                    </p>
                  )}
                  {item.principle && (
                    <p className="mt-2 text-[0.92rem] leading-[1.45] text-[rgba(244,240,255,0.84)]">
                      {item.principle}
                    </p>
                  )}
                </aside>
              )}
              <div className="space-y-3">
                {item.body.map((para, i) => (
                  <p key={i} className="text-[rgba(244,240,255,0.85)] text-[0.98rem] leading-[1.6]">
                    {para}
                  </p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {item.stack.map((tag) => (
                  <span
                    key={tag}
                    className="
                    px-2.5 py-1 rounded-full border border-[var(--color-line)]
                    font-[var(--font-mono)] text-[0.68rem] tracking-[0.16em] uppercase
                    text-[var(--color-muted)]
                  "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <WorkModalNav onPrevious={onPrevious} onNext={onNext} position={position} />
            <WorkModalLinks item={item} />
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
      {children}
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
