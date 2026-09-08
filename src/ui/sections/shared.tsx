import type { ReactNode } from 'react';

export const PANEL_BASE = 'panel pointer-events-auto max-w-[420px]';
// Wide tracking adds a letter-space after the final glyph, which makes a centered eyebrow read
// as shifted left. The negative inline-end margin cancels exactly that space, and needs
// `inline-block` to apply. jsdom does no layout, so nothing can test this.
export const EYEBROW =
  'inline-block font-[var(--font-mono)] text-[0.6rem] md:text-[0.66rem] tracking-[0.28em] md:tracking-[0.4em] -me-[0.28em] md:-me-[0.4em] text-[var(--color-muted)] uppercase';
export const H2 =
  'mt-3 mb-2.5 text-[clamp(1.8rem,4vw,2.6rem)] leading-[0.98] font-semibold tracking-[-0.03em]';
export const P_LI =
  'text-[clamp(0.95rem,1.3vw,1.05rem)] leading-[1.55] text-[rgba(244,240,255,0.78)]';
export const UL_BASE =
  'list-none p-0 mt-4 [&>li]:py-2.5 [&>li]:border-t [&>li]:border-white/[0.07] [&>li:last-child]:border-b [&>li:last-child]:border-white/[0.07]';

export type SectionSide = 'left' | 'right' | 'center';

export function Section({
  id,
  side,
  desktopVertical = 'center',
  children,
}: {
  id: string;
  side: SectionSide;
  // Top-aligns the taller desktop panels, which would otherwise run under the brand block.
  desktopVertical?: 'center' | 'top';
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
        snap-start snap-always
        px-[6vw] md:px-[5vw]
        pt-[12vh] pb-[max(13rem,24vh)]
        ${desktopVertical === 'top' ? 'md:items-start md:pt-[11rem] md:pb-12' : 'md:py-0'}
        justify-center text-center
        ${desktopJustify} ${desktopText}
      `}
    >
      {children}
    </section>
  );
}
