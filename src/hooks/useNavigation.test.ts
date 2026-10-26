// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SECTION_IDS } from '../config';
import { useAppStore } from '../store';
import { useNavigation } from './useNavigation';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let offset: number;
let frames: FrameRequestCallback[];
let finishFonts: () => void;
let fontDescriptor: PropertyDescriptor | undefined;
let previous: ReturnType<typeof useAppStore.getState>;

function Probe() {
  useNavigation();
  return null;
}

beforeEach(async () => {
  previous = useAppStore.getState();
  offset = 8;
  frames = [];
  vi.stubGlobal('innerHeight', 900);
  vi.stubGlobal('scrollY', 0);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const index = SECTION_IDS.indexOf(this.id as (typeof SECTION_IDS)[number]);
    const top = offset + Math.max(0, index) * 900;
    return { top, bottom: top + 900 } as DOMRect;
  });
  fontDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
  const ready = new Promise<void>((resolve) => {
    finishFonts = resolve;
  });
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready } });
  document.body.innerHTML = SECTION_IDS.map((id) => `<section id="${id}"></section>`).join('');
  const host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(() => {
    useAppStore.setState({ sectionIndex: 0, isContactVisible: false });
    root.render(createElement(Probe));
  });
});

afterEach(async () => {
  await act(() => root.unmount());
  document.body.replaceChildren();
  delete document.body.dataset.carControls;
  delete document.body.dataset.carView;
  delete document.body.dataset.contactView;
  if (fontDescriptor) Object.defineProperty(document, 'fonts', fontDescriptor);
  else Reflect.deleteProperty(document, 'fonts');
  useAppStore.setState(previous);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('refreshes controls after initial position settling without a resize or scroll', async () => {
  expect(document.body.dataset.carControls).toBe('hidden');
  offset = 0;
  await act(() => {
    for (const frame of frames.splice(0)) frame(performance.now());
  });
  expect(document.body.dataset.carControls).toBe('visible');
});

it('refreshes controls when font layout settles after the first frame', async () => {
  await act(() => {
    for (const frame of frames.splice(0)) frame(performance.now());
  });
  expect(document.body.dataset.carControls).toBe('hidden');
  offset = 0;
  await act(async () => finishFonts());
  expect(document.body.dataset.carControls).toBe('visible');
});
