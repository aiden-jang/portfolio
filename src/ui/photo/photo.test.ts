// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { useAppStore } from '../../store';
import { usePhotoMode } from './state';
import { captureScene } from './capture';
afterEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true);
  usePhotoMode.getState().close();
  vi.useRealTimers();
});
it('opens only for a ready Intro and always lets the visitor exit', () => {
  for (const blocked of [
    { sectionIndex: 5 },
    { sectionIndex: 1 },
    { isCarLoading: true },
    { carLoadError: 'Failed' },
    { sceneUnavailable: true },
  ]) {
    useAppStore.setState(
      { ...useAppStore.getInitialState(), isCarLoading: false, ...blocked },
      true,
    );
    usePhotoMode.getState().open();
    expect(usePhotoMode.getState().active).toBe(false);
  }
  useAppStore.setState({ ...useAppStore.getInitialState(), isCarLoading: false }, true);
  usePhotoMode.getState().open();
  expect(usePhotoMode.getState().active).toBe(true);
  usePhotoMode.getState().close();
  expect(usePhotoMode.getState().active).toBe(false);
});
it('settles a missing scene capture with a retryable error instead of hanging', async () => {
  vi.useFakeTimers();
  const capture = captureScene();
  const rejected = expect(capture).rejects.toThrow('Try again');
  await vi.advanceTimersByTimeAsync(10000);
  await rejected;
});
