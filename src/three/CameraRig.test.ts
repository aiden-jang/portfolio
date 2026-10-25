// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { PerspectiveCamera } from 'three';
import { CameraRig } from './CameraRig';
import { useAppStore } from '../store';

let frame: (
  state: { size: { width: number; height: number }; clock: { elapsedTime: number } },
  dt: number,
) => void;
const camera = new PerspectiveCamera(35, 1440 / 900, 0.1, 200);
const canvas = document.createElement('canvas');
vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: typeof frame) => {
    frame = callback;
  },
  useThree: () => ({ camera, gl: { domElement: canvas } }),
}));
vi.mock('../hooks/reducedMotion', () => ({ prefersReducedMotion: () => false }));
vi.mock('./useContactArrival', () => ({ useContactArrival: () => () => {} }));

afterEach(() => {
  vi.restoreAllMocks();
  useAppStore.setState(useAppStore.getInitialState(), true);
  document.body.replaceChildren();
});

function pointer(type: string, x: number, y: number) {
  const event = new MouseEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true });
  Object.assign(event, { pointerId: 1, pointerType: 'mouse', isPrimary: true });
  window.dispatchEvent(event);
}

it('holds the chosen camera angle after dragging until the view is reset', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const intro = document.createElement('section');
  intro.id = 'sec-intro';
  vi.spyOn(intro, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 900 } as DOMRect);
  const host = document.createElement('div');
  document.body.append(intro, host);
  const root = createRoot(host);
  try {
    await act(() => root.render(createElement(CameraRig, { getScrollT: () => 0 })));
    const tick = () =>
      frame({ size: { width: 1440, height: 900 }, clock: { elapsedTime: 5 } }, 0.1);
    tick();
    await act(() => {
      pointer('pointerdown', 400, 400);
      pointer('pointermove', 500, 450);
      pointer('pointerup', 500, 450);
    });
    tick();
    const chosen = camera.position.clone();
    for (let index = 0; index < 30; index++) tick();
    expect(
      camera.position.distanceTo(chosen),
      'manual view must not resume automatic rotation',
    ).toBeLessThan(0.000001);
    expect(useAppStore.getState()).toMatchObject({ hasManualView: true });
    await act(() => useAppStore.getState().resetCamera());
    tick();
    expect(camera.position.distanceTo(chosen)).toBeGreaterThan(1);
    expect(useAppStore.getState()).toMatchObject({ hasManualView: false });
  } finally {
    await act(() => root.unmount());
  }
});
