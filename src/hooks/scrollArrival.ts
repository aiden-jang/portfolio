import { useEffect, type RefObject } from 'react';

export const shortPhoneQuery = '(max-width: 767px) and (max-height: 699px)';

type Scene = {
  stage: HTMLElement;
  visibleArea?: RefObject<HTMLElement>;
  showResult: (active: boolean) => void;
  settled: boolean;
  seen: boolean;
};

const scenes = new Set<Scene>();
let frame = 0;
let previous = 0;
let previousAt = 0;
let rapidUntil = 0;
let navigationUntil = 0;
let lastInput = -Infinity;

export function lastScrollInput() {
  return lastInput;
}

function noteScrollInput() {
  lastInput = performance.now();
}

function setResult(scene: Scene, active: boolean) {
  if (scene.settled === active) return;
  scene.settled = active;
  scene.seen = false;
  if (active) scene.stage.dataset.sceneArrival = 'result';
  else delete scene.stage.dataset.sceneArrival;
  scene.showResult(active);
}

function update(now: number) {
  frame = 0;
  const delta = Math.abs(scrollY - previous);
  previous = scrollY;
  const elapsed = now - previousAt;
  previousAt = now;
  const height = innerHeight;
  if (
    now - lastInput < 240 &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    now > navigationUntil &&
    (delta > height * 0.27 ||
      (elapsed < 80 && delta > height * 0.037 && delta / elapsed > height * 0.0028))
  )
    rapidUntil = now + 240;

  for (const scene of scenes) {
    if (!scene.stage.getClientRects().length) continue;
    const panel =
      scene.visibleArea?.current ?? scene.stage.querySelector('[data-study-pin]') ?? scene.stage;
    const box = panel.getBoundingClientRect();
    const visible = box.bottom > height * 0.24 && box.top < height * 0.71;
    if (!scene.settled && visible && now < rapidUntil) setResult(scene, true);
    if (!scene.settled) continue;
    if (visible) scene.seen = true;
    if (scene.seen && (box.bottom < 0 || box.top > height)) setResult(scene, false);
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}

export function prepareSectionArrival(id: string) {
  navigationUntil = performance.now() + 1050;
  rapidUntil = 0;
  const subject = id === 'sec-experience' ? 'batching-study' : id;
  for (const scene of scenes)
    if ((scene.stage.id || scene.stage.closest('article')?.id) === subject) setResult(scene, true);
}

export function useScrollArrival(
  target: RefObject<HTMLElement>,
  enabled: boolean,
  showResult: Scene['showResult'],
  visibleArea?: RefObject<HTMLElement>,
) {
  useEffect(() => {
    const stage = target.current;
    if (!enabled || !stage) return;
    const scene = { stage, visibleArea, showResult, settled: false, seen: false };
    if (!scenes.size) {
      previous = scrollY;
      previousAt = performance.now();
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('wheel', noteScrollInput, { passive: true });
      addEventListener('touchmove', noteScrollInput, { passive: true });
      addEventListener('hashchange', onHashChange);
    }
    scenes.add(scene);
    if (location.hash === '#' + (stage.id || stage.closest('article')?.id)) setResult(scene, true);
    else if (location.hash) prepareSectionArrival(location.hash.slice(1));
    return () => {
      scenes.delete(scene);
      delete stage.dataset.sceneArrival;
      if (!scenes.size) {
        removeEventListener('scroll', schedule);
        removeEventListener('wheel', noteScrollInput);
        removeEventListener('touchmove', noteScrollInput);
        removeEventListener('hashchange', onHashChange);
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
  }, [target, enabled, showResult, visibleArea]);
}

// Project deep links can change independently of section navigation.
function onHashChange() {
  prepareSectionArrival(location.hash.slice(1));
}

export const projectArrivalAnchors = [
  'project-everythingisfine',
  'project-iodine',
  'project-bloomnote',
  'project-iguess',
  'project-mrrp',
  'project-wherever',
  'project-owewell',
  'project-worth',
  'batching-study',
  'f40-study',
];
