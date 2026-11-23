import { useEffect, useRef } from 'react';
import { canStudyRender, useAppStore } from '../store';
import { ControlIcon } from './ControlIcon';
import { useDialogFocus } from './useDialogFocus';
import { usePageScrollLock } from './usePageScrollLock';
import './render-study.css';

export function RenderStudy() {
  const finish = useAppStore((state) => state.renderFinish);
  const setFinish = useAppStore((state) => state.setRenderFinish);
  const active = finish !== null;
  const dialog = useRef<HTMLElement>(null);
  const exit = useRef<HTMLButtonElement>(null);
  usePageScrollLock(active);
  useDialogFocus(active, dialog, exit);

  useEffect(() => {
    if (!active) return;
    const unsubscribe = useAppStore.subscribe((state) => {
      if (state.renderFinish && !canStudyRender(state)) setFinish(null);
    });
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        setFinish(null);
      }
    };
    window.addEventListener('keydown', key, true);
    return () => {
      window.removeEventListener('keydown', key, true);
      unsubscribe();
      queueMicrotask(() =>
        Array.from(document.querySelectorAll<HTMLButtonElement>('.all-controls-trigger'))
          .find((button) => button.getClientRects().length)
          ?.focus({ preventScroll: true }),
      );
    };
  }, [active, setFinish]);

  if (!finish) return null;
  return (
    <section
      ref={dialog}
      className="render-study"
      role="dialog"
      aria-modal="true"
      aria-labelledby="render-study-title"
    >
      <div className="render-study-heading">
        <h2 id="render-study-title">Behind the render</h2>
        <p>Ferrari F40</p>
      </div>
      <button
        ref={exit}
        type="button"
        className="render-study-exit"
        onClick={() => setFinish(null)}
      >
        <ControlIcon name="arrow" />
        Garage
      </button>
      <div className="render-study-controls">
        <div role="group" aria-label="Ferrari render finish" className="render-study-finish">
          <button
            type="button"
            onClick={() => {
              useAppStore.getState().setThemeName('studio');
              setFinish(null);
            }}
          >
            Studio
          </button>
          <button type="button" aria-pressed={finish === 'clay'} onClick={() => setFinish('clay')}>
            Clay
          </button>
        </div>
        <p role="status">
          {finish === 'studio'
            ? 'Paint, studio light and the floor reflection.'
            : 'A matte finish brings the bodywork into focus.'}
        </p>
        <details className="render-study-notes">
          <summary>How I built it</summary>
          <div>
            <p>
              The floor renders a second view of the car for the reflection. It fades with distance
              and dims as you scroll into Featured work.
            </p>
            <p>The camera adjusts to fit the car’s bounds on narrower screens.</p>
          </div>
        </details>
      </div>
    </section>
  );
}
