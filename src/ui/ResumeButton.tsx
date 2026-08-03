import { useRef } from 'react';
import { useMagnetic } from '../hooks/useMagnetic';

/** Top-right pill that opens the resume PDF in a new tab. Inside the Nav row
 *  on desktop, standalone-fixed on mobile where the Nav is hidden. */
export function ResumeButton() {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref, 0.35);
  return (
    <a
      ref={ref}
      href="/Aiden_Jang_Resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="
        group pointer-events-auto
        inline-flex items-center justify-center gap-1.5
        px-4 py-1.5 min-h-[44px] md:px-3.5 md:min-h-0 rounded-full
        border border-[var(--color-line)]
        font-[var(--font-mono)] text-[0.7rem] tracking-[0.22em] uppercase
        text-[var(--color-fg)] no-underline
        transition-[border-color,color,transform] duration-200 will-change-transform
        hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]
      "
    >
      <span>Resume</span>
      <span
        aria-hidden
        className="text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-neon)]"
      >
        ↗
      </span>
    </a>
  );
}
