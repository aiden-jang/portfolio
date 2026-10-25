import type { ReactNode } from 'react';

export const PANEL_BASE = 'panel pointer-events-auto max-w-[420px]';
// Wide tracking adds a letter-space after the final glyph, which makes a centered eyebrow read
// as shifted left. The negative inline-end margin cancels exactly that space, and needs
// `inline-block` to apply. jsdom does no layout, so nothing can test this.
export const EYEBROW =
  'inline-block font-[var(--font-mono)] text-[0.6875rem] md:text-xs tracking-[0.16em] -me-[0.16em] text-[var(--color-muted)] uppercase';
export const H2 =
  'mt-3 mb-4 text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] font-medium tracking-[-0.04em]';
export const P_LI =
  'text-[clamp(1rem,1.3vw,1.0625rem)] leading-[1.65] text-[rgba(244,240,255,0.78)]';
export const UL_BASE =
  'list-none p-0 mt-4 [&>li]:py-2.5 [&>li]:border-t [&>li]:border-white/[0.07] [&>li:last-child]:border-b [&>li:last-child]:border-white/[0.07]';

export type SectionSide = 'left' | 'right' | 'center';

export function Section({
  id,
  side,
  desktopVertical = 'center',
  mobileVertical = 'center',
  children,
}: {
  id: string;
  side: SectionSide;
  desktopVertical?: 'center' | 'top';
  mobileVertical?: 'center' | 'top';
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
        min-h-[100dvh] flex pointer-events-none
        px-[6vw] md:px-[5vw]
        ${mobileVertical === 'top' ? 'items-start pt-[11vh]' : 'items-center pt-[12vh]'}
        pb-[max(13rem,24vh)]
        ${desktopVertical === 'top' ? 'md:items-start md:pt-[11rem] md:pb-12' : 'md:items-center md:py-0'}
        justify-center text-center
        ${desktopJustify} ${desktopText}
      `}
    >
      {children}
    </section>
  );
}
