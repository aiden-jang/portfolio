import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '../hooks/reducedMotion';

export function useStoryMotion(title: string | undefined, dialog: RefObject<HTMLElement>) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const content = dialog.current?.querySelector('.story-scroll-area');
    const animation = content?.animate(
      [
        { opacity: 0.75, transform: 'translateX(6px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: 200, easing: 'cubic-bezier(.16,1,.3,1)' },
    );
    return () => animation?.cancel();
  }, [title, dialog]);
}
