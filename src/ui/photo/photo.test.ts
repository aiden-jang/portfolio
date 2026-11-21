// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { useAppStore } from '../../store';
import { usePhotoMode } from './state';
import { CAPTURE_EVENT, captureScene, type CaptureRequest } from './capture';
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

it('allows an accepted capture to finish after the renderer lookup deadline', async () => {
  vi.useFakeTimers();
  let request: CaptureRequest | undefined;
  const accept = (event: Event) => {
    request = (event as CustomEvent<CaptureRequest>).detail;
    request.accept();
  };
  window.addEventListener(CAPTURE_EVENT, accept, { once: true });
  const capture = captureScene();
  const result = expect(capture).resolves.toBeInstanceOf(Blob);
  await vi.advanceTimersByTimeAsync(15_000);
  request?.resolve(new Blob(['photo'], { type: 'image/png' }));
  await result;
});
