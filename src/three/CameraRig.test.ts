// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector3 } from 'three';
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
  const model = new Mesh(new BoxGeometry(2, 1.4, 6), new MeshBasicMaterial());
  model.position.y = 0.7;
  useAppStore.getState().refs.carModel = model;
  try {
    await act(() => root.render(createElement(CameraRig, { getScrollT: () => 0 })));
    const tick = (width = 1440, height = 900) =>
      frame({ size: { width, height }, clock: { elapsedTime: 5 } }, 0.1);
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
    camera.aspect = 320 / 844;
    camera.updateProjectionMatrix();
    tick(320, 844);
    camera.updateMatrixWorld();
    expect(camera.position.y).toBeGreaterThanOrEqual(0.25 - 0.000001);
    expect(Math.atan2(camera.position.x, camera.position.z)).toBeCloseTo(
      Math.atan2(chosen.x, chosen.z),
    );
    const bounds = new Box3().setFromObject(model);
    for (let corner = 0; corner < 8; corner++) {
      const point = new Vector3(
        corner & 1 ? bounds.max.x : bounds.min.x,
        corner & 2 ? bounds.max.y : bounds.min.y,
        corner & 4 ? bounds.max.z : bounds.min.z,
      ).project(camera);
      expect(Math.abs(point.x)).toBeLessThanOrEqual(1 - 48 / 320 + 0.000001);
    }
    await act(() => useAppStore.getState().resetCamera());
    tick();
    expect(camera.position.distanceTo(chosen)).toBeGreaterThan(1);
    expect(useAppStore.getState()).toMatchObject({ hasManualView: false });
  } finally {
    await act(() => root.unmount());
    model.geometry.dispose();
    model.material.dispose();
  }
});

it('bounds intro zoom, resets its pose and leaves Contact fixed', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  for (const width of [1440, 390]) {
    useAppStore.setState({ ...useAppStore.getInitialState(), isCarLoading: false }, true);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const model = new Mesh(new BoxGeometry(1.6, 1.2, 3.7), new MeshBasicMaterial());
    model.position.y = 0.6;
    useAppStore.getState().refs.carModel = model;
    let scrollT = 0;
    camera.aspect = width / 900;
    camera.updateProjectionMatrix();
    try {
      await act(() => root.render(createElement(CameraRig, { getScrollT: () => scrollT })));
      const tick = () => frame({ size: { width, height: 900 }, clock: { elapsedTime: 5 } }, 0.1);
      await act(tick);
      const original = camera.position.clone();
      await act(() => useAppStore.getState().setCameraZoom(9));
      await act(tick);
      camera.updateMatrixWorld();
      expect(camera.position.distanceTo(new Vector3(0, 0.55, 0))).toBeCloseTo(
        original.distanceTo(new Vector3(0, 0.55, 0)) / 1.25,
      );
      expect(camera.position.y).toBeGreaterThanOrEqual(0.25);
      await act(() => useAppStore.getState().resetCamera());
      await act(tick);
      expect(camera.position.distanceTo(original)).toBeLessThan(0.000001);
      await act(() => useAppStore.getState().setCameraZoom(0.85));
      await act(tick);
      expect(camera.position.distanceTo(new Vector3(0, 0.55, 0))).toBeGreaterThan(
        original.distanceTo(new Vector3(0, 0.55, 0)),
      );
      scrollT = 1;
      await act(() => useAppStore.setState({ sectionIndex: 5, isContactVisible: true }));
      await act(tick);
      const contact = camera.position.clone();
      await act(() => useAppStore.setState({ cameraZoom: 1.25 }));
      await act(tick);
      expect(camera.position.distanceTo(contact)).toBeLessThan(0.000001);
    } finally {
      await act(() => root.unmount());
      host.remove();
      model.geometry.dispose();
      model.material.dispose();
    }
  }
});
