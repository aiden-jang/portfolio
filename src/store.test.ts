import { afterEach, describe, expect, it } from 'vitest';
import { useAppStore } from './store';

afterEach(() => useAppStore.setState(useAppStore.getInitialState(), true));

describe('car retry', () => {
  it('retries the selected car without changing the garage', () => {
    useAppStore.setState({
      carIndex: 2,
      themeName: 'night',
      carLoadError: 'Failed',
      isCarLoading: false,
    });
    useAppStore.getState().retryCar();
    expect(useAppStore.getState()).toMatchObject({
      carIndex: 2,
      themeName: 'night',
      carLoadError: null,
      isCarLoading: true,
      carRetryVersion: 1,
    });
  });
  it('allows another retry after another failed attempt', () => {
    useAppStore.getState().retryCar();
    useAppStore.setState({ carLoadError: 'Failed again', isCarLoading: false });
    useAppStore.getState().retryCar();
    expect(useAppStore.getState()).toMatchObject({
      carLoadError: null,
      isCarLoading: true,
      carRetryVersion: 2,
    });
  });
});
