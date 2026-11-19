import { useEffect, useRef } from 'react';
import type { Object3D } from 'three';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { useAppStore } from '../store';
import { usePhotoMode } from '../ui/photo/state';

type Still = { canvas: HTMLCanvasElement; index: number };
type Blend = { canvas: HTMLCanvasElement; motion: Animation };

export function useCarSwapBlend() {
  const displayed = useRef<{ model: Object3D; index: number }>();
  const pending = useRef<Still>();
  const blend = useRef<Blend>();

  useEffect(() => {
    const interrupt = () => {
      pending.current = undefined;
      blend.current?.motion.cancel();
      blend.current?.canvas.remove();
      blend.current = undefined;
    };
    window.addEventListener('scroll', interrupt, { passive: true });
    window.addEventListener('resize', interrupt);
    window.addEventListener('pointerdown', interrupt, { passive: true });
    document.addEventListener('visibilitychange', interrupt);
    return () => {
      window.removeEventListener('scroll', interrupt);
      window.removeEventListener('resize', interrupt);
      window.removeEventListener('pointerdown', interrupt);
      document.removeEventListener('visibilitychange', interrupt);
      interrupt();
    };
  }, []);

  return (canvas: HTMLCanvasElement) => {
    const { carIndex, isCarLoading, refs, sectionIndex, renderFinish, carLoadError } =
      useAppStore.getState();
    const model = refs.carModel;
    const last = displayed.current;
    if (!model) return;
    if (last?.model !== model) displayed.current = { model, index: carIndex };

    if (
      sectionIndex !== 0 ||
      scrollY >= innerHeight * 0.15 ||
      renderFinish ||
      carLoadError ||
      usePhotoMode.getState().active ||
      !canvas.parentElement ||
      prefersReducedMotion()
    ) {
      pending.current = undefined;
      return;
    }

    if (last && last.model !== model) {
      const still = pending.current;
      pending.current = undefined;
      if (still?.index !== carIndex) return;
      blend.current?.motion.cancel();
      blend.current?.canvas.remove();
      canvas.parentElement.append(still.canvas);
      const motion = still.canvas.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 245,
        easing: 'cubic-bezier(.22,.61,.36,1)',
      });
      const completed = { canvas: still.canvas, motion };
      blend.current = completed;
      const remove = () => {
        completed.canvas.remove();
        if (blend.current === completed) blend.current = undefined;
      };
      void motion.finished.then(remove, remove);
    } else if (
      last &&
      isCarLoading &&
      last.index !== carIndex &&
      pending.current?.index !== carIndex
    ) {
      const shot = document.createElement('canvas');
      shot.width = canvas.width;
      shot.height = canvas.height;
      shot.className = 'studio-car-swap';
      shot.setAttribute('aria-hidden', 'true');
      const context = shot.getContext('2d');
      if (!context || !shot.animate) return;
      // Sample the composed outgoing frame, so the studio and its reflection share the transition.
      context.drawImage(canvas, 0, 0);
      pending.current = { index: carIndex, canvas: shot };
    }
  };
}
