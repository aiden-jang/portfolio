// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { SceneBoundary } from './SceneBoundary';
import { useAppStore } from '../store';

it('offers recovery without losing the selected garage and remounts a working scene on retry', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const onError = (event: ErrorEvent) => {
    if (event.error?.message === 'No WebGL') event.preventDefault();
  };
  window.addEventListener('error', onError);
  useAppStore.setState({ carIndex: 1, activeBodyColor: '#3f464e', themeName: 'night' });
  let available = false;
  const Scene = () => {
    if (!available) throw new Error('No WebGL');
    return createElement('p', null, 'Garage ready');
  };
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(() => root.render(createElement(SceneBoundary, { children: createElement(Scene) })));
    expect(useAppStore.getState().sceneUnavailable).toBe(true);
    expect(host.textContent).toContain('Retry 3D');
    available = true;
    await act(() => useAppStore.getState().retryScene());
    expect(host.textContent).toBe('Garage ready');
    expect(useAppStore.getState()).toMatchObject({
      sceneUnavailable: false,
      carIndex: 1,
      activeBodyColor: '#3f464e',
      themeName: 'night',
    });
  } finally {
    await act(() => root.unmount());
    host.remove();
    useAppStore.setState(useAppStore.getInitialState(), true);
    errors.mockRestore();
    warnings.mockRestore();
    window.removeEventListener('error', onError);
  }
});
