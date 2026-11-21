import { useEffect, type RefObject } from 'react';

export function useGlobeCardPosition(figure: RefObject<HTMLElement>, hasSelection: boolean) {
  useEffect(() => {
    if (!hasSelection || !figure.current) return;
    const node = figure.current;
    const positionCard = () => {
      const image = node.querySelector('.orbit-preview');
      if (image)
        node.style.setProperty('--creative-orbit-top', image.getBoundingClientRect().top + 'px');
    };
    positionCard();
    window.addEventListener('scroll', positionCard, { passive: true });
    window.addEventListener('resize', positionCard);
    return () => {
      window.removeEventListener('scroll', positionCard);
      window.removeEventListener('resize', positionCard);
      node.style.removeProperty('--creative-orbit-top');
    };
  }, [figure, hasSelection]);
}
