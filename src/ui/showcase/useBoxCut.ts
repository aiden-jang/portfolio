import { useLayoutEffect, type RefObject } from 'react';
import { clamp } from '../../math';

export function useBoxCut(track: RefObject<HTMLElement>, stage: RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    const article = track.current;
    const table = stage.current;
    const room = article?.previousElementSibling;
    const entrance = article?.querySelector<HTMLElement>('.supper-entrance');
    const photo = table?.querySelector<HTMLElement>('.meal-photo');
    const linen = table?.querySelector<HTMLElement>('.meal-linen');
    if (!article || !table || !room?.matches('.studio-route') || !entrance || !photo || !linen)
      return;

    let frame = 0;
    let inset = parseFloat(getComputedStyle(table).top) || 0;

    const paint = () => {
      frame = 0;
      const travel = entrance.offsetHeight;
      const progress = travel
        ? clamp((inset - article.getBoundingClientRect().top) / travel, 0, 1)
        : 1;
      const phase = progress === 0 ? 'waiting' : progress === 1 ? 'open' : 'opening';
      if (article.dataset.cut !== phase) {
        article.dataset.cut = phase;
        table.inert = phase !== 'open';
        if (phase !== 'opening') {
          linen.style.removeProperty('clip-path');
          table.style.removeProperty('--paper-arrival');
          photo.style.removeProperty('transform');
        }
      }
      if (phase !== 'opening') return;

      const box = room.querySelector('.hit-box')?.getBoundingClientRect();
      const bounds = table.getBoundingClientRect();
      const centerX = box?.width ? box.left + box.width / 2 - bounds.left : bounds.width * 0.49;
      const centerY = box?.height ? box.top + box.height / 2 - bounds.top : bounds.height * 0.72;
      const printWidth = (box?.width || bounds.width * 0.123) * 0.81;
      const printHeight = printWidth * 0.61;

      const lift = progress * progress * (3 - 2 * progress);
      const remaining = 1 - lift;
      const spread = clamp((progress - 0.47) / 0.45, 0, 1);
      const edges = [centerY, bounds.width - centerX, bounds.height - centerY, centerX];
      const clip = edges.map((edge) => Math.max(0, edge * (1 - spread)) + 'px').join(' ');
      const width = photo.offsetWidth;
      const height = photo.offsetHeight;
      const scale = Math.max(printWidth / width, printHeight / height) ** remaining;
      const x = (centerX - photo.offsetLeft - width / 2) * remaining;
      const y = (centerY - photo.offsetTop - height / 2) * remaining;

      linen.style.clipPath = `inset(${clip})`;
      table.style.setProperty('--paper-arrival', String(clamp((progress - 0.82) / 0.18, 0, 1)));
      photo.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${-3 * lift}deg)`;
    };

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const size = new ResizeObserver(() => {
      inset = parseFloat(getComputedStyle(table).top) || 0;
      queue();
    });
    addEventListener('scroll', queue, { passive: true });
    size.observe(table);
    size.observe(entrance);
    paint();
    return () => {
      size.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener('scroll', queue);
      table.inert = false;
      delete article.dataset.cut;
    };
  }, [track, stage]);
}
