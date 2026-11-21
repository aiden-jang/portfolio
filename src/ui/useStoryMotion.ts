import { useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { prefersReducedMotion } from '../hooks/reducedMotion';

export function useStoryMotion(
  title: string | undefined,
  dialog: RefObject<HTMLElement>,
  direction: MutableRefObject<1 | -1 | 0>,
) {
  const previous = useRef(title);
  useLayoutEffect(() => {
    const travel = direction.current;
    direction.current = 0;
    const turning = title && previous.current && previous.current !== title && travel;
    previous.current = title;
    if (!turning || prefersReducedMotion() || !Element.prototype.animate) return;
    const targets = dialog.current?.querySelectorAll('.work-modal-title, .story-scroll-shell');
    const animations = Array.from(targets ?? []).map((element) =>
      element.animate(
        [
          { opacity: 0.34, transform: 'translateX(' + 18 * travel + 'px)' },
          { opacity: 1, transform: 'translateX(0)' },
        ],
        { duration: 275, easing: 'cubic-bezier(.17,.78,.18,1)' },
      ),
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [title, dialog, direction]);
}
