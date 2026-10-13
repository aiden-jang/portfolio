import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CARS } from './config';
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

describe('car selection lifecycle', () => {
  it('wraps in both directions and releases the previous paint material', () => {
    const state = useAppStore.getState();
    state.refs.bodyMaterial = new THREE.MeshStandardMaterial();
    state.refs.bodyOriginalColor = new THREE.Color('red');
    useAppStore.setState({
      carIndex: CARS.length - 1,
      activeBodyColor: '#ff0000',
      hasBodyMaterial: true,
    });
    state.cycleCar();
    expect(useAppStore.getState()).toMatchObject({
      carIndex: 0,
      activeBodyColor: 'original',
      hasBodyMaterial: false,
    });
    expect(state.refs.bodyMaterial).toBeNull();
    expect(state.refs.bodyOriginalColor).toBeNull();
    state.prevCar();
    expect(useAppStore.getState().carIndex).toBe(CARS.length - 1);
  });
});
