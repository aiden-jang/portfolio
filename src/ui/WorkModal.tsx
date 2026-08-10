import { useEffect, useState, type ReactNode } from 'react';
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
};

type Props = {
  item: WorkDetail | null;
  onClose: () => void;
};

/** Centered detail card opened from a Work row. Backdrop click + Escape close.
 *  Locks body scroll while open. No glass — clean dimmed overlay + opaque
 *  panel to keep readability high. */
export function WorkModal({ item, onClose }: Props) {
  const open = !!item;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

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
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.classList.remove('modal-open');
      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

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
        onClick={(e) => e.stopPropagation()}
        style={open ? { viewTransitionName: 'work-morph' } : undefined}
        className={`
          relative flex flex-col w-full max-w-[640px] max-h-[85dvh] overflow-hidden
          bg-[#0a0a14] border border-[var(--color-line)] rounded-xl
          transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        <button
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
                      Designed for · {item.moment}
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
            {(item.link || item.links?.length) && (
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
