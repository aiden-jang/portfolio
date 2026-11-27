import { useLayoutEffect, type RefObject } from 'react';

export function useFlowerGrowth(
  article: RefObject<HTMLElement>,
  growth: number,
  selected: number,
  composing: boolean,
) {
  // The ink leaves the actual note, then the selected flower opens in the same color.
  useLayoutEffect(() => {
    const host = article.current;
    if (!growth || !host || composing || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const ink = host.querySelector<HTMLElement>('.studio-note-pollen');
    const note = host.querySelector<HTMLElement>('.studio-quote-text');
    const globe = host.querySelector<SVGGElement>('[aria-pressed="true"] .studio-flower-head');
    if (!ink || !note || !globe) return;
    const base = host.getBoundingClientRect();
    const phrase = note.getBoundingClientRect();
    const head = globe.getBoundingClientRect();
    const mobile = host.clientWidth < 740;
    const x0 = (mobile ? phrase.left + phrase.width * 0.67 : phrase.right - 9) - base.left;
    const y0 = (mobile ? phrase.bottom - 4 : phrase.top + phrase.height * 0.65) - base.top;
    const x1 = head.left + head.width * 0.5 - base.left;
    const y1 = head.top + head.height * 0.5 - base.top;
    const bend = mobile ? 20 : 44;
    const point = (x: number, y: number, scale: number) =>
      `translate(${x}px, ${y}px) rotate(-27deg) scale(${scale})`;
    const animation = ink.animate(
      [
        { transform: point(x0, y0, 0.24), opacity: 0 },
        { transform: point(x0, y0, 0.85), opacity: 1, offset: 0.12 },
        {
          transform: point((x0 + x1) * 0.5, (y0 + y1) * 0.5 - bend, 1.12),
          opacity: 1,
          offset: 0.52,
        },
        { transform: point(x1, y1, 0.48), opacity: 1, offset: 0.91 },
        { transform: point(x1, y1, 0.16), opacity: 0 },
      ],
      {
        duration: 840,
        delay: 60,
        easing: 'cubic-bezier(.35,0,.18,1)',
        fill: 'both',
      },
    );
    const flowerAnimation = globe.animate(
      [
        { transform: 'rotate(-8deg) scale(.22)', opacity: 0.2 },
        { transform: 'rotate(2deg) scale(1.035)', opacity: 1, offset: 0.8 },
        { transform: 'none', opacity: 1 },
      ],
      {
        duration: 560,
        delay: 650,
        easing: 'cubic-bezier(.16,.8,.3,1)',
        fill: 'backwards',
      },
    );
    return () => {
      animation.cancel();
      flowerAnimation.cancel();
    };
  }, [article, growth, selected, composing]);
}
