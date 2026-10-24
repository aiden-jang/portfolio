import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { useAppStore } from '../store';

export const SCENE_ACTIVITY_EVENT = 'portfolio:scene-activity';
const SETTLE_MS = 2000;

export function useSceneActivity(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(media.matches);
      setActive(true);
    };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!reduced) return;
    let timer = 0;
    const wake = () => {
      setActive(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setActive(false), SETTLE_MS);
    };
    const move = (event: PointerEvent) => {
      if (event.buttons) wake();
    };
    const visible = () => {
      if (!document.hidden) wake();
    };
    const unsubscribe = useAppStore.subscribe((next, previous) => {
      if (
        next.carIndex !== previous.carIndex ||
        next.carRetryVersion !== previous.carRetryVersion ||
        next.themeName !== previous.themeName ||
        next.drsOpen !== previous.drsOpen ||
        next.flashVersion !== previous.flashVersion ||
        next.headlightsRaised !== previous.headlightsRaised ||
        next.activeBodyColor !== previous.activeBodyColor ||
        next.hasBodyMaterial !== previous.hasBodyMaterial ||
        next.isCarLoading !== previous.isCarLoading ||
        next.cameraResetVersion !== previous.cameraResetVersion ||
        next.sectionIndex !== previous.sectionIndex ||
        next.isContactVisible !== previous.isContactVisible
      )
        wake();
    });
    const events = [
      'pointerdown',
      'pointerup',
      'keydown',
      'scroll',
      'resize',
      SCENE_ACTIVITY_EVENT,
    ];
    for (const event of events)
      window.addEventListener(event, wake, { passive: true, capture: true });
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('visibilitychange', visible);
    timer = window.setTimeout(() => setActive(false), SETTLE_MS);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
      for (const event of events) window.removeEventListener(event, wake, true);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [reduced]);
  return !reduced || active;
}
