import { useCallback, useLayoutEffect, type RefObject } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import { useTimedScene } from '../../hooks/useTimedScene';

function quakeTravel(stage: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  return Math.min(
    Number(stage.dataset.globeFocusLimit ?? 1),
    easedProgress(Number(stage.dataset.studyProgress) || 0, 0.03, 0.6),
  );
}

export function advanceQuake(stage: HTMLElement, progress: number) {
  const immediate = matchMedia('(prefers-reduced-motion: reduce)').matches;
  stage.style.setProperty(
    '--depth-reveal',
    String(immediate ? 1 : easedProgress(progress, 0.32, 0.49)),
  );
  stage.toggleAttribute('data-depth-readings', immediate || progress >= 0.32);
  stage.dataset.studyProgress = progress.toFixed(3);
  const canvas = stage.querySelector('canvas');
  if (canvas) syncQuakeCamera(canvas);
}

export function setQuakeManual(element: HTMLElement | null, manual: boolean) {
  element?.closest('.quake-journey-run')?.toggleAttribute('data-quake-manual', manual);
}

export function syncQuakeCamera(canvas: HTMLCanvasElement) {
  const stage = canvas.closest<HTMLElement>('.quake-journey-run');
  if (stage && !stage.hasAttribute('data-quake-manual'))
    canvas.dispatchEvent(new CustomEvent('quake-journey', { detail: quakeTravel(stage) }));
}

function setQuakeOpening(figure: HTMLElement | null, progress: number) {
  const stage = figure?.closest<HTMLElement>('.quake-journey-run');
  if (!stage) return;
  if (progress < 1) {
    const limit = easedProgress(progress, 0.6, 1);
    stage.dataset.globeFocusLimit = String(limit);
    stage.style.setProperty('--globe-depth-reveal', String(easedProgress(limit, 0.52, 0.82)));
  } else {
    delete stage.dataset.globeFocusLimit;
    stage.style.removeProperty('--globe-depth-reveal');
  }
  const canvas = figure?.querySelector('canvas');
  if (canvas) syncQuakeCamera(canvas);
}

export function useQuakeOpening(figure: RefObject<HTMLElement>, enabled: boolean, ready: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const element = figure.current;
    setQuakeOpening(element, 0);
    return () => setQuakeOpening(element, 1);
  }, [enabled, figure]);
  const draw = useCallback(
    (progress: number) => setQuakeOpening(figure.current, progress),
    [figure],
  );
  useTimedScene(figure, draw, {
    enabled: enabled && ready,
    duration: 1830,
    startThreshold: 0.24,
    restartAfterExit: true,
  });
}

export function settleQuake(progress: number) {
  return progress > 0.16 && progress < 0.6 ? 0.6 : progress;
}
