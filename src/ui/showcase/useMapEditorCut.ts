import { useEffect, type RefObject } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import './map-editor-cut.css';

const MOTION = '(prefers-reduced-motion: no-preference) and (min-height: 620px)';

export function useMapEditorCut(group: RefObject<HTMLDivElement>) {
  useEffect(() => {
    const stage = group.current;
    const quake = stage?.querySelector<HTMLElement>('#project-everythingisfine');
    const editor = stage?.querySelector<HTMLElement>('.recovery');
    if (!stage || !quake || !editor) return;

    const motion = matchMedia(MOTION);
    let frame = 0;
    let passedMap = false;

    const paint = () => {
      frame = 0;
      const settled =
        motion.matches &&
        quake.dataset.quakeView === 'map' &&
        !quake.hasAttribute('data-quake-manual') &&
        quake.classList.contains('quake-journey-run');
      if (!settled) {
        passedMap = false;
        stage.removeAttribute('data-map-editor-cut');
        return;
      }

      const height = Math.max(1, innerHeight);
      const arrival = 1 - editor.getBoundingClientRect().top / height;
      if (arrival >= 0.68) {
        stage.removeAttribute('data-map-editor-cut');
        return;
      }

      const mapBox = quake.querySelector('.quake-map-image')?.getBoundingClientRect();
      if (mapBox && mapBox.bottom > height * 0.32 && arrival < 0.1) passedMap = true;
      const active = !!mapBox && passedMap && arrival > -0.26;
      stage.toggleAttribute('data-map-editor-cut', active);
      if (!active || !mapBox) return;

      // The map artwork's graticule is spaced every 60 units in its 1100 × 650 viewBox.
      const pitch = 60 * Math.max(mapBox.width / 1100, mapBox.height / 650);
      const receive = easedProgress(arrival, 0.02, 0.32);
      const resolve = easedProgress(arrival, 0.31, 0.65);
      const release = easedProgress(arrival, -0.24, 0.18) * (1 - receive);
      stage.style.setProperty('--map-cut-pitch', `${pitch}px`);
      stage.style.setProperty('--map-cut-release', release.toFixed(3));
      stage.style.setProperty('--map-cut-receive', receive.toFixed(3));
      stage.style.setProperty('--map-cut-resolve', resolve.toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const state = new MutationObserver(schedule);
    state.observe(quake, {
      attributes: true,
      attributeFilter: ['class', 'data-quake-view', 'data-quake-manual'],
    });
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      state.disconnect();
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      stage.removeAttribute('data-map-editor-cut');
      for (const name of ['pitch', 'release', 'receive', 'resolve']) {
        stage.style.removeProperty(`--map-cut-${name}`);
      }
    };
  }, [group]);
}
