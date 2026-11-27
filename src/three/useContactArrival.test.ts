// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { PerspectiveCamera } from 'three';
import { KEYFRAMES } from '../config';
import { finishStudyFrame, useFinishStudy } from './finishStudy';
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
  useFinishStudy.setState({ active: false });
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
    applyArrival({ ...KEYFRAMES.at(-1)! }, true);
    expect(camera.view?.enabled).toBe(true);
    expect(camera.aspect).toBeCloseTo(320 / 820);

    sectionTop = 600;
    const untouched = { ...KEYFRAMES[0] };
    applyArrival(untouched, true);
    expect(camera.view?.enabled).toBe(false);
    expect(camera.aspect).toBeCloseTo(320 / 568);
    expect(untouched).toEqual(KEYFRAMES[0]);

    applyArrival(untouched, true, 0);
    expect(camera.view?.enabled).toBe(true);
    applyArrival(null, true);
    expect(camera.view?.enabled).toBe(false);
    expect(camera.aspect).toBeCloseTo(320 / 568);

    Object.assign(size, { width: 390, height: 844 });
    sectionTop = 1000;
    applyArrival(untouched, true);
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
    applyArrival(pose, true);
    expect(pose.azimuth).toBeCloseTo(0.29);
    expect(pose.elevation).toBeCloseTo(0.61);
    expect(camera.view?.height).toBe(740);
    size.height = 568;
    applyArrival({ ...KEYFRAMES.at(-1)! }, true);
    expect(camera.view?.height).toBe(568);
    expect(camera.view?.fullHeight).toBe(820);
  } finally {
    await act(() => root.unmount());
  }
});

it('matches the fixed Contact pose at the end of the study on all three layouts', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const section = document.createElement('section');
  section.id = 'sec-contact';
  let sectionTop = 0;
  vi.spyOn(section, 'getBoundingClientRect').mockImplementation(() => {
    const height = Math.max(size.height, 780);
    return { top: sectionTop, bottom: sectionTop + height, height } as DOMRect;
  });
  const host = document.createElement('div');
  document.body.append(section, host);
  const root = createRoot(host);
  try {
    await act(() => root.render(createElement(Probe)));
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [375, 667],
    ]) {
      Object.assign(size, { width, height });
      sectionTop = 0;
      useFinishStudy.setState({ active: false });
      const contact = { ...KEYFRAMES[0] };
      applyArrival(contact, false);
      const contactView = { ...camera.view };
      const study = { ...KEYFRAMES[0] };
      sectionTop = 1;
      useFinishStudy.setState({ active: true });
      Object.assign(finishStudyFrame, { progress: 1, top: 0 });
      applyArrival(study, false);
      expect(study).toEqual(contact);
      expect(camera.view).toEqual(contactView);
      finishStudyFrame.progress = 0;
      applyArrival(study, false);
      expect(study.elevation).toBeLessThan(contact.elevation);
    }
  } finally {
    await act(() => root.unmount());
  }
});

it('keeps Contact fixed when motion is reduced or the window is too short for the live study', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.assign(size, { width: 844, height: 390 });
  const section = document.createElement('section');
  section.id = 'sec-contact';
  let top = 150;
  vi.spyOn(section, 'getBoundingClientRect').mockImplementation(
    () => ({ top, bottom: top + 780, height: 780 }) as DOMRect,
  );
  const host = document.createElement('div');
  document.body.append(section, host);
  const root = createRoot(host);
  try {
    await act(() => root.render(createElement(Probe)));
    const entering = { ...KEYFRAMES[0] };
    applyArrival(entering, false);
    const enteringView = { ...camera.view! };
    top = 0;
    const shown = { ...KEYFRAMES[0] };
    applyArrival(shown, true);
    expect(shown).toEqual(entering);
    expect(camera.view?.offsetY).toBeCloseTo(enteringView.offsetY + 150);
  } finally {
    await act(() => root.unmount());
  }
});
