import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { MarkKey } from './marks';

export type WorkDetail = {
  title: string;
  summary: string;
  context: string;
  body: string[];
  stack: string[];
  /** Optional screenshot shown as a banner at the top of the detail card.
   *  Missing files degrade gracefully — the banner hides itself on load error. */
  image?: string;
  /** Optional external link rendered as the primary "Visit" button at the bottom. */
  link?: { label: string; url: string };
  /** Optional secondary links (Source, Architecture, case study, …) rendered as
   *  outline pills next to the primary button. Each renders only when present,
   *  so a not-yet-public repo simply omits its entry rather than dead-linking. */
  links?: { label: string; url: string }[];
  /** Shipped-app fields, set on the live entries so they render as product
   *  cards in the Work grid (the rest render as editorial rows). */
  mark?: MarkKey;
  /** Short product name for the card (the title carries the longer form). */
  shortName?: string;
  /** Short one-liner for the card, sized to fit without an ellipsis (the
   *  `summary` is the longer version used in the modal). */
  tagline?: string;
  /** Optional looping preview clip (webm/mp4) played on hover in the card.
   *  Falls back to the mark when absent or on load error. */
  preview?: string;
  /** The small human moment this product is designed to improve. Shown in the
   *  card and case study so the projects scan as products, not just stacks. */
  moment?: string;
  /** A concise product decision worth surfacing before the technical detail. */
  principle?: string;
  /** Browsing lenses used by the project explorer. Omitted for professional
   * case studies because they remain in the Experience section. */
  categories?: Array<'realtime' | 'ai' | 'social' | 'systems'>;
};

type Props = {
  item: WorkDetail | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  position: { current: number; total: number } | null;
};

/** Centered detail card opened from a Work row. Backdrop click + Escape close.
 *  Locks body scroll while open. No glass — clean dimmed overlay + opaque
 *  panel to keep readability high. */
export function WorkModal({ item, onClose, onPrevious, onNext, position }: Props) {
  const open = !!item;
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setCopied(false), [item]);

  // A direct case-study URL should feel specific in a browser tab as well as
  // in the page. This is client-side metadata (social crawlers still receive
  // the portfolio's static preview), but it makes a shared link much easier to
  // recognize when someone has several tabs open.
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

    // Robust scroll lock. The scroll root here is <html> (see index.css), so
    // `document.body { overflow: hidden }` does NOT stop the page from scrolling
    // behind the modal — and iOS ignores overflow locks entirely. Pin the body in
    // place at the current offset and restore the scroll position on close; this
    // is the one technique that holds on every platform.
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
    // Lets CSS hide fixed chrome (the mobile bottom bar) that would otherwise
    // bleed through the overlay and overlap the modal on phones.
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
      // A direct `#work/...` link has no originating card, so only restore if
      // the former element is still connected to this document.
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [onClose, onNext, onPrevious, open]);

  const copyCaseStudyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be unavailable in a private or embedded browser.
      // The current URL is still a normal, shareable deep link in that case.
    }
  };

  // Portal to <body> so the modal escapes the page's `<main class="z-10">` stacking context.
  // Rendered inline, its z-50 was trapped below the z-30 fixed mobile bottom bar, whose (invisible
  // but still hit-testable) section-dot buttons sat over the modal's action links and swallowed the
  // tap — the reported "side-project links don't work on mobile". At <body> the z-50 overlay is
  // truly above all chrome.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
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
          // Keep normal vertical reading scroll untouched. A deliberate,
          // mostly-horizontal swipe steps through the neighboring case study.
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
            {/* Scrollable body. overscroll-contain stops the scroll from chaining to the page
                behind the modal when you hit the top or bottom. */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 pt-5 md:p-7 md:pt-6">
              {item.image && (
                <WorkBanner key={item.image} src={item.image} alt={`${item.title} screenshot`} />
              )}
              <Eyebrow>{item.context}</Eyebrow>
              <h3 className="mt-3 mb-1 text-[clamp(1.6rem,3.2vw,2.2rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
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
            <div className="shrink-0 flex items-center justify-between gap-3 px-5 md:px-7 py-3 border-t border-[var(--color-line)]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onPrevious}
                  aria-label="Previous case study"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  aria-label="Next case study"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
                >
                  →
                </button>
                {position && (
                  <>
                    <span className="ml-2 font-[var(--font-mono)] text-[0.58rem] tracking-[0.14em] text-[var(--color-muted)]">
                      {position.current} / {position.total}
                    </span>
                    <span
                      role="progressbar"
                      aria-label="Case study progress"
                      aria-valuemin={1}
                      aria-valuemax={position.total}
                      aria-valuenow={position.current}
                      className="ml-1 h-px w-8 overflow-hidden bg-white/[0.14]"
                    >
                      <span
                        className="block h-full origin-left bg-[var(--color-neon)] transition-transform duration-300"
                        style={{ transform: `scaleX(${position.current / position.total})` }}
                      />
                    </span>
                  </>
                )}
              </div>
              <span className="font-[var(--font-mono)] text-[0.5rem] tracking-[0.1em] uppercase text-[rgba(244,240,255,0.38)] md:hidden">
                Swipe to browse
              </span>
              <span className="font-[var(--font-mono)] text-[0.55rem] tracking-[0.12em] uppercase text-[rgba(244,240,255,0.38)] max-md:hidden">
                ← → browse
              </span>
            </div>
            {(item.link || item.links?.length || item.shortName) && (
              // Footer lives OUTSIDE the scroll area (a flex sibling), so it is always flush to the
              // panel's bottom edge, spans the full width, and never overlaps the body text — the
              // body scrolls in its own region above it. Always visible + tappable regardless of
              // how long the description is.
              <div className="shrink-0 flex flex-wrap gap-2.5 px-5 md:px-7 py-4 border-t border-[var(--color-line)]">
                {item.link && (
                  <a
                    href={item.link.url}
                    target="_blank"
                    rel="noopener"
                    className="
                      inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                      border border-[var(--color-line)]
                      font-[var(--font-mono)] text-[0.72rem] tracking-[0.2em] uppercase
                      text-[var(--color-fg)] no-underline transition-colors
                      hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]
                    "
                  >
                    {item.link.label}
                    <span aria-hidden="true">→</span>
                  </a>
                )}
                {item.links?.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener"
                    className="
                      inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                      border border-[var(--color-line)]
                      font-[var(--font-mono)] text-[0.72rem] tracking-[0.2em] uppercase
                      text-[var(--color-muted)] no-underline transition-colors
                      hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]
                    "
                  >
                    {l.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
                <button
                  type="button"
                  onClick={() => void copyCaseStudyLink()}
                  className="
                    inline-flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer
                    border border-[var(--color-line)]
                    font-[var(--font-mono)] text-[0.72rem] tracking-[0.2em] uppercase
                    text-[var(--color-muted)] transition-colors
                    hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]
                  "
                >
                  {copied ? 'Link copied' : 'Copy link'}
                  <span aria-hidden="true">{copied ? '✓' : '↗'}</span>
                </button>
              </div>
            )}
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

/** Full-bleed screenshot banner at the top of the card. Bleeds past the card
 *  padding (negative margins match the `p-7 pt-6` panel). Hides itself if the
 *  image fails to load so a missing file never leaves a broken-image icon. */
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
