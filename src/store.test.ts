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

describe('car paint defaults', () => {
  it('restores each selected car finish and keeps the Ferrari source red', () => {
    for (const [index, car] of CARS.entries()) {
      const state = useAppStore.getState();
      state.setCarIndex(index);
      const material = new THREE.MeshStandardMaterial({ color: '#c42128' });
      const original = material.color.clone();
      state.refs.bodyMaterial = material;
      state.refs.bodyOriginalColor = original;
      state.applyBodyColor('#222222');
      state.applyBodyColor('original');
      expect(material.color.getHexString()).toBe(
        car.defaultPaint.preserveSource ? original.getHexString() : car.defaultPaint.hex.slice(1),
      );
      expect(useAppStore.getState().activeBodyColor).toBe('original');
    }
  });

  it('cycles through a car palette and returns to its default', () => {
    const state = useAppStore.getState();
    state.setCarIndex(6);
    state.refs.bodyMaterial = new THREE.MeshStandardMaterial();
    state.refs.bodyOriginalColor = state.refs.bodyMaterial.color!.clone();
    const visited = new Set<string>();
    for (let i = 0; i < 7; i++) {
      visited.add(useAppStore.getState().activeBodyColor);
      state.cycleBodyColor();
    }
    expect(visited.size).toBe(7);
    expect(useAppStore.getState().activeBodyColor).toBe('original');
    expect(state.refs.bodyMaterial.color!.getHexString()).toBe(CARS[6].defaultPaint.hex.slice(1));
  });
});
