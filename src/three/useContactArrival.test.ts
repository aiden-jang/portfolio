// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { PerspectiveCamera } from 'three';
import { KEYFRAMES } from '../config';
import { useContactArrival } from './useContactArrival';

const camera = new PerspectiveCamera(35, 1440 / 900, 0.1, 200);
const size = { width: 1440, height: 900 };
let applyArrival: ReturnType<typeof useContactArrival>;
vi.mock('@react-three/fiber', () => ({ useThree: () => ({ camera, size }) }));

function Probe() {
  applyArrival = useContactArrival();
  return null;
}

afterEach(() => {
  vi.restoreAllMocks();
  camera.clearViewOffset();
  Object.assign(size, { width: 1440, height: 900 });
  document.body.replaceChildren();
});

it('restores the viewport projection when Contact leaves the screen', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  let sectionTop = 0;
  Object.assign(size, { width: 320, height: 568 });
  const section = document.createElement('section');
  section.id = 'sec-contact';
  vi.spyOn(section, 'getBoundingClientRect').mockImplementation(
    () => ({ top: sectionTop, bottom: sectionTop + 820, height: 820 }) as DOMRect,
  );
  const host = document.createElement('div');
  document.body.append(section, host);
  const root = createRoot(host);
  try {
    await act(() => root.render(createElement(Probe)));
    applyArrival({ ...KEYFRAMES.at(-1)! }, 0, true);
    expect(camera.view?.enabled).toBe(true);
    expect(camera.aspect).toBeCloseTo(320 / 820);

    sectionTop = 600;
    const untouched = { ...KEYFRAMES[0] };
    applyArrival(untouched, 0, true);
    expect(camera.view?.enabled).toBe(false);
    expect(camera.aspect).toBeCloseTo(320 / 568);
    expect(untouched).toEqual(KEYFRAMES[0]);

    applyArrival(untouched, 0, true, 0);
    expect(camera.view?.enabled).toBe(true);
    applyArrival(null, 0, true);
    expect(camera.view?.enabled).toBe(false);
    expect(camera.aspect).toBeCloseTo(320 / 568);

    Object.assign(size, { width: 390, height: 844 });
    sectionTop = 1000;
    applyArrival(untouched, 0, true);
    expect(camera.aspect).toBeCloseTo(390 / 844);
  } finally {
    await act(() => root.unmount());
  }
});

it('updates the viewport crop when a short phone resizes inside the same tall section', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.assign(size, { width: 390, height: 740 });
  const section = document.createElement('section');
  section.id = 'sec-contact';
  vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    bottom: 820,
    height: 820,
  } as DOMRect);
  const host = document.createElement('div');
  document.body.append(section, host);
  const root = createRoot(host);
  try {
    await act(() => root.render(createElement(Probe)));
    const pose = { ...KEYFRAMES.at(-1)! };
    applyArrival(pose, 0, true);
    expect(pose.azimuth).toBeCloseTo(0.29);
    expect(pose.elevation).toBeCloseTo(0.61);
    expect(camera.view?.height).toBe(740);
    size.height = 568;
    applyArrival({ ...KEYFRAMES.at(-1)! }, 0, true);
    expect(camera.view?.height).toBe(568);
    expect(camera.view?.fullHeight).toBe(820);
  } finally {
    await act(() => root.unmount());
  }
});
