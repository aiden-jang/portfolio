import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { frameFromTrigger } from './triggerMotion';
let version = 0;
let animations: Animation[] = [];
function animate(element: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions) {
  if (!element) return;
  const animation = element.animate(frames, options);
  void animation.finished.catch(() => {});
  animations.push(animation);
}
export function runMorph(update: () => void, origin: HTMLElement | null, opening: boolean): void {
  const current = ++version;
  for (const animation of animations) animation.cancel();
  animations = [];
  if (prefersReducedMotion() || !Element.prototype.animate) {
    update();
    return;
  }
  if (opening) {
    flushSync(update);
    const panel = document.querySelector('.work-modal-panel');
    animate(
      panel,
      [
        frameFromTrigger(panel, origin, 0.075, 28, 0.957) ?? {
          opacity: 0,
          transform: 'translateY(14px) scale(.99)',
        },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ],
      { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' },
    );
    animate(
      document.querySelector('.work-modal-overlay'),
      [{ backgroundColor: 'rgba(5,5,13,0)' }, { backgroundColor: 'rgba(5,5,13,.9)' }],
      { duration: 160, easing: 'ease-out' },
    );
    return;
  }
  const panel = document.querySelector('.work-modal-panel');
  if (!panel) {
    update();
    return;
  }
  animate(
    panel,
    [
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      frameFromTrigger(panel, origin, 0.075, 28, 0.957) ?? {
        opacity: 0,
        transform: 'translateY(10px) scale(.99)',
      },
    ],
    { duration: 170, easing: 'ease-out', fill: 'forwards' },
  );
  animate(
    document.querySelector('.work-modal-overlay'),
    [{ backgroundColor: 'rgba(5,5,13,.9)' }, { backgroundColor: 'rgba(5,5,13,0)' }],
    { duration: 170, easing: 'ease-out', fill: 'forwards' },
  );
  void Promise.allSettled(animations.map((a) => a.finished)).then(() => {
    if (current === version) {
      update();
      animations = [];
    }
  });
}
