// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector3 } from 'three';
import { CameraRig } from './CameraRig';
import { useAppStore } from '../store';
import { DEFAULT_CAR_INDEX, F40_INDEX, KEYFRAMES } from '../config';
import { replayOpeningOrbit, useOpeningPlayback } from './openingPlayback';
import { prefersReducedMotion } from '../hooks/reducedMotion';

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
vi.mock('../hooks/reducedMotion', () => ({ prefersReducedMotion: vi.fn(() => false) }));
vi.mock('./useContactArrival', () => ({ useContactArrival: () => () => {} }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(prefersReducedMotion).mockReturnValue(false);
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
      const target = new Vector3(0, 0.55, 0);
      const distance = camera.position.distanceTo(target);
      const desired = original.distanceTo(target) / 1.25;
      if (width < 768) {
        expect(distance).toBeGreaterThan(desired);
        expect(distance).toBeLessThan(original.distanceTo(target));
        model.updateMatrixWorld(true);
        const vertices = model.geometry.attributes.position;
        for (let i = 0; i < vertices.count; i++) {
          const point = new Vector3()
            .fromBufferAttribute(vertices, i)
            .applyMatrix4(model.matrixWorld)
            .project(camera);
          expect(Math.abs(point.x)).toBeLessThanOrEqual(1 - 32 / width + 0.000001);
        }
      } else expect(distance).toBeCloseTo(desired);
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

it('animates curated views, permits orbit afterwards and leaves Contact unchanged', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  for (const width of [1440, 390]) {
    useAppStore.setState({ ...useAppStore.getInitialState(), isCarLoading: false }, true);
    const intro = document.createElement('section');
    intro.id = 'sec-intro';
    vi.spyOn(intro, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 900 } as DOMRect);
    const host = document.createElement('div');
    document.body.append(intro, host);
    const root = createRoot(host);
    let scrollT = 0;
    camera.aspect = width / 900;
    camera.updateProjectionMatrix();
    const tick = () => frame({ size: { width, height: 900 }, clock: { elapsedTime: 5 } }, 1 / 60);
    try {
      await act(() => root.render(createElement(CameraRig, { getScrollT: () => scrollT })));
      await act(tick);
      const original = camera.position.clone();
      await act(() => useAppStore.getState().setCameraView('profile'));
      await act(tick);
      expect(camera.position.distanceTo(original)).toBeGreaterThan(0);
      expect(Math.atan2(camera.position.x, camera.position.z)).toBeLessThan(Math.PI / 2);
      await act(() => {
        for (let i = 0; i < 60; i++) tick();
      });
      expect(Math.atan2(camera.position.x, camera.position.z)).toBeCloseTo(Math.PI / 2);
      await act(() => {
        pointer('pointerdown', 400, 400);
        pointer('pointermove', 450, 400);
        pointer('pointerup', 450, 400);
      });
      await act(tick);
      expect(Math.atan2(camera.position.x, camera.position.z)).toBeCloseTo(Math.PI / 2 + 0.5);
      await act(() => useAppStore.getState().resetCamera());
      await act(tick);
      expect(camera.position.distanceTo(original)).toBeLessThan(0.000001);
      await act(() => useAppStore.getState().setCameraView('detail'));
      await act(tick);
      scrollT = 1;
      await act(() => useAppStore.setState({ sectionIndex: 5, isContactVisible: true }));
      await act(tick);
      const contact = camera.position.clone();
      await act(() => useAppStore.getState().setCameraView('front'));
      await act(() => {
        for (let i = 0; i < 60; i++) tick();
      });
      expect(camera.position.distanceTo(contact)).toBeLessThan(0.000001);
    } finally {
      await act(() => root.unmount());
      intro.remove();
      host.remove();
    }
  }
});

async function withOpeningCamera(
  width: number,
  exercise: (view: {
    tick: (count?: number) => void;
    yaw: () => number;
    scrollTo: (position: number) => void;
    load: (ready?: boolean) => void;
  }) => void,
) {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const initial = useAppStore.getInitialState();
  useAppStore.setState(
    {
      ...initial,
      refs: { ...initial.refs, carModel: null, introArmed: false },
    },
    true,
  );
  const intro = document.createElement('section');
  intro.id = 'sec-intro';
  vi.spyOn(intro, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 900 } as DOMRect);
  const host = document.createElement('div');
  document.body.append(intro, host);
  const root = createRoot(host);
  const model = new Mesh(new BoxGeometry(1.6, 1.2, 3.7), new MeshBasicMaterial());
  let scrollT = 0;
  const tick = (count = 1) => {
    for (let index = 0; index < count; index++)
      frame({ size: { width, height: 844 }, clock: { elapsedTime: 0 } }, 1 / 60);
  };
  try {
    await act(() => root.render(createElement(CameraRig, { getScrollT: () => scrollT })));
    exercise({
      tick,
      yaw: () => Math.atan2(camera.position.x, camera.position.z),
      scrollTo: (position) => {
        scrollT = position;
      },
      load: (ready = true) => {
        useAppStore.getState().refs.carModel = model;
        useAppStore.getState().armIntro();
        useAppStore.getState().setCarLoading(!ready);
      },
    });
  } finally {
    await act(() => root.unmount());
    intro.remove();
    host.remove();
    model.geometry.dispose();
    model.material.dispose();
  }
}

it('loops the shared angles on desktop and mobile and replays from the front', async () => {
  for (const [width, degrees] of [
    [1440, 26],
    [390, 20],
  ]) {
    await withOpeningCamera(width, ({ tick, yaw, load }) => {
      useAppStore.setState({ carIndex: F40_INDEX });
      load(false);
      tick(240);
      expect(yaw()).toBeCloseTo(KEYFRAMES[0].azimuth - (degrees * Math.PI) / 180, 5);
      expect(useOpeningPlayback.getState().playback).toBe('off');

      load();
      tick(35);
      const front = yaw();
      const frontHeight = camera.position.y;
      expect(front).toBeGreaterThan(KEYFRAMES[0].azimuth);
      tick(115);
      expect(yaw()).toBeLessThan(-2);
      tick(110);
      expect(camera.position.y).toBeGreaterThan(frontHeight * 2);
      tick(114);
      expect(yaw()).toBeCloseTo(front, 5);
      expect(useOpeningPlayback.getState().playback).toBe('playing');

      tick(115);
      replayOpeningOrbit();
      tick(35);
      expect(yaw()).toBeCloseTo(front, 5);
    });
  }
});

it('waits for the replacement model before playing the selected car’s shots', async () => {
  await withOpeningCamera(1440, ({ tick, yaw, load }) => {
    load();
    tick(60);
    const { refs, setCarIndex, setCarLoading } = useAppStore.getState();
    const replacement = refs.carModel!.clone();
    setCarIndex(F40_INDEX);
    tick(240);
    expect(useOpeningPlayback.getState().playback).toBe('off');
    setCarLoading(true);
    refs.carModel = replacement;
    tick(80);
    expect(useOpeningPlayback.getState().playback).toBe('off');
    setCarLoading(false);
    tick(35);
    expect(yaw()).toBeGreaterThan(KEYFRAMES[0].azimuth);
    expect(useOpeningPlayback.getState().playback).toBe('playing');
  });
});

it('loops distinct Corvette shots and holds the view during pause', async () => {
  for (const width of [1440, 390]) {
    await withOpeningCamera(width, ({ tick, yaw, load }) => {
      load();
      tick(60);
      const wide = yaw();
      const wideDistance = camera.position.length();
      expect(wide).toBeGreaterThan(0.7);
      useOpeningPlayback.getState().toggle();
      tick(180);
      expect(yaw()).toBeCloseTo(wide, 5);
      useOpeningPlayback.getState().toggle();
      tick(100);
      expect(camera.position.length()).toBeLessThan(wideDistance * 0.55);
      tick(80);
      expect(yaw()).toBeLessThan(-2);
      tick(100);
      expect(camera.position.y).toBeGreaterThan(7);
      tick(122);
      expect(yaw()).toBeCloseTo(wide, 1);
    });
  }
});

it('hands the in-flight angle to a drag and does not resume the cuts', async () => {
  await withOpeningCamera(1440, ({ tick, yaw, load }) => {
    load();
    tick(60);
    const swept = yaw();
    expect(swept).toBeGreaterThan(KEYFRAMES[0].azimuth + 0.2);
    pointer('pointerdown', 400, 400);
    tick();
    expect(yaw()).toBeCloseTo(swept, 5);
    pointer('pointermove', 430, 400);
    pointer('pointerup', 430, 400);
    tick(180);
    expect(yaw()).toBeCloseTo(swept + 0.3, 5);
    expect(useOpeningPlayback.getState().playback).toBe('off');
  });
});

it('restarts both camera sequences on short and long returns to Intro, except under reduced motion', async () => {
  for (const [width, carIndex] of [
    [390, DEFAULT_CAR_INDEX],
    [1440, F40_INDEX],
  ]) {
    await withOpeningCamera(width, ({ tick, yaw, load, scrollTo }) => {
      useAppStore.setState({ carIndex });
      load();
      tick(60);
      const first = yaw();
      expect(useOpeningPlayback.getState().playback).toBe('playing');
      for (const position of [0.02, 0.2]) {
        scrollTo(position);
        tick();
        expect(useOpeningPlayback.getState().playback).toBe('off');
        scrollTo(0);
        tick(60);
        expect(useOpeningPlayback.getState().playback).toBe('playing');
        expect(yaw()).toBeCloseTo(first, 3);
      }
    });
  }
  vi.mocked(prefersReducedMotion).mockReturnValue(true);
  await withOpeningCamera(390, ({ tick, yaw, load, scrollTo }) => {
    load();
    tick();
    expect(yaw()).toBeCloseTo(KEYFRAMES[0].azimuth, 5);
    scrollTo(0.2);
    tick();
    scrollTo(0);
    tick(60);
    expect(yaw()).toBeCloseTo(KEYFRAMES[0].azimuth, 5);
  });
});

it('holds the wheel composition through a short drag and returns to the whole car on a wider orbit', async () => {
  await withOpeningCamera(1440, ({ tick, load }) => {
    useAppStore.getState().setCarIndex(0);
    load();
    tick(120);
    useAppStore.getState().setCameraView('wheel');
    tick(60);
    const target = new Vector3();
    camera.getWorldDirection(target);
    target.multiplyScalar(2.84).add(camera.position);
    expect(target.x).toBeGreaterThan(0.3);
    expect(target.z).toBeGreaterThan(0.5);

    pointer('pointerdown', 400, 400);
    pointer('pointermove', 424, 400);
    tick();
    expect(camera.position.distanceTo(target)).toBeCloseTo(2.84, 3);

    pointer('pointermove', 590, 400);
    pointer('pointerup', 590, 400);
    tick(120);
    expect(camera.position.distanceTo(new Vector3(0, 0.55, 0))).toBeGreaterThan(8);
    useAppStore.getState().resetCamera();
    tick(60);
    expect(Math.atan2(camera.position.x, camera.position.z)).toBeCloseTo(KEYFRAMES[0].azimuth);
  });
});
