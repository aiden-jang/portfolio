import { useEffect, useState, type ReactNode } from 'react';
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
  /** Optional external link rendered as a "Visit" button at the bottom. */
  link?: { label: string; url: string };
  /** Shipped-app fields, set on the live entries so they render as product
   *  cards in the Work grid (the rest render as editorial rows). */
  mark?: MarkKey;
  /** Short product name for the card (the title carries the longer form). */
  shortName?: string;
  /** Optional looping preview clip (webm/mp4) played on hover in the card.
   *  Falls back to the mark when absent or on load error. */
  preview?: string;
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      onClick={onClose}
      className={`
        fixed inset-0 z-50 flex items-center justify-center px-4
        bg-[rgba(5,5,13,0.78)]
        transition-opacity duration-200
        ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-[640px] max-h-[80vh] overflow-auto
          bg-[#0a0a14] border border-[var(--color-line)] rounded-xl
          p-7 pt-6
          transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            absolute top-3 right-3 w-9 h-9 rounded-full
            border border-[var(--color-line)] bg-transparent
            text-[var(--color-muted)] text-xl leading-none
            hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]
            transition-colors
          "
        >
          ×
        </button>

        {item && (
          <>
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
            {item.link && (
              <a
                href={item.link.url}
                target="_blank"
                rel="noopener"
                className="
                  inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full
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
          </>
        )}
      </div>
    </div>
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
    <div className="-mx-7 -mt-6 mb-5 border-b border-[var(--color-line)] overflow-hidden">
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
