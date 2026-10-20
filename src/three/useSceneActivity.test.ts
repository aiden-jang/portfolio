// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '../store';
import { SCENE_ACTIVITY_EVENT, useSceneActivity } from './useSceneActivity';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let host: HTMLDivElement;
let media: EventTarget & { matches: boolean };
let previous: ReturnType<typeof useAppStore.getState>;
function Probe() {
  return createElement('output', null, String(useSceneActivity()));
}
async function change(update: () => void) {
  await act(async () => update());
}
async function settle() {
  await change(() => vi.advanceTimersByTime(2100));
}
beforeEach(async () => {
  vi.useFakeTimers();
  previous = useAppStore.getState();
  media = Object.assign(new EventTarget(), { matches: true });
  vi.stubGlobal('matchMedia', () => media);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await change(() => root.render(createElement(Probe)));
});
afterEach(async () => {
  await change(() => root.unmount());
  host.remove();
  useAppStore.setState(previous);
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('reduced-motion render activity', () => {
  it('rests when idle and wakes for scrolling, dragging and newly loaded effects', async () => {
    expect(host.textContent).toBe('true');
    await settle();
    expect(host.textContent).toBe('false');
    await change(() => window.dispatchEvent(new MouseEvent('pointermove', { buttons: 0 })));
    expect(host.textContent).toBe('false');
    await change(() => window.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 })));
    expect(host.textContent).toBe('true');
    await settle();
    await change(() => window.dispatchEvent(new Event('scroll')));
    expect(host.textContent).toBe('true');
    await settle();
    await change(() => window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT)));
    expect(host.textContent).toBe('true');
  });
  it('wakes for loading changes without staying active on unchanged store notifications', async () => {
    await settle();
    await change(() => useAppStore.setState({ sectionIndex: previous.sectionIndex }));
    expect(host.textContent).toBe('false');
    await change(() => useAppStore.getState().setCarLoading(!previous.isCarLoading));
    expect(host.textContent).toBe('true');
    await settle();
    await change(() => useAppStore.getState().setCarLoading(previous.isCarLoading));
    expect(host.textContent).toBe('true');
  });
  it('keeps normal animation running and responds to motion-preference changes', async () => {
    await change(() => {
      media.matches = false;
      media.dispatchEvent(new Event('change'));
    });
    await settle();
    expect(host.textContent).toBe('true');
    await change(() => {
      media.matches = true;
      media.dispatchEvent(new Event('change'));
    });
    await settle();
    expect(host.textContent).toBe('false');
    await change(() => {
      media.matches = false;
      media.dispatchEvent(new Event('change'));
    });
    expect(host.textContent).toBe('true');
  });
});
