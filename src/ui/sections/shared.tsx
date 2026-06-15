import type { ReactNode } from 'react';

/** Tailwind class strings reused across every section. Centralized so a tweak
 *  applies everywhere (eyebrow scale, heading hierarchy, body line-height). */
export const PANEL_BASE = 'panel pointer-events-auto max-w-[420px]';
export const EYEBROW =
  'font-[var(--font-mono)] text-[0.66rem] tracking-[0.4em] text-[var(--color-muted)] uppercase';
export const H2 =
  'mt-3 mb-2.5 text-[clamp(1.8rem,4vw,2.6rem)] leading-[0.98] font-semibold tracking-[-0.03em]';
export const P_LI =
  'text-[clamp(0.95rem,1.3vw,1.05rem)] leading-[1.55] text-[rgba(244,240,255,0.78)]';
export const UL_BASE =
  'list-none p-0 mt-4 [&>li]:py-2.5 [&>li]:border-t [&>li]:border-white/[0.07] [&>li:last-child]:border-b [&>li:last-child]:border-white/[0.07]';

export type SectionSide = 'left' | 'right' | 'center';

/** Full-screen scroll-section wrapper. On desktop the content aligns per the
 *  `side` prop; on mobile every section centers + adds vertical padding so
 *  the panel sits clear of the brand block and the bottom dots/hint. */
export function Section({
  id,
  side,
  children,
}: {
  id: string;
  side: SectionSide;
  children: ReactNode;
}) {
  const desktopJustify =
    side === 'left'
      ? 'md:justify-start'
      : side === 'right'
        ? 'md:justify-end'
        : 'md:justify-center';
  const desktopText = side === 'center' ? 'md:text-center' : 'md:text-left';
  return (
    <section
      id={id}
      className={`
        min-h-screen flex items-center pointer-events-none
        px-[6vw] md:px-[5vw]
        pt-[22vh] pb-[22vh] md:py-0
        justify-center text-center
        ${desktopJustify} ${desktopText}
      `}
    >
      {children}
    </section>
  );
}
