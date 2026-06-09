import { useEffect, type ReactNode } from 'react';

export type WorkDetail = {
  title: string;
  summary: string;
  context: string;
  body: string[];
  stack: string[];
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
