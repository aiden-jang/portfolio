import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CARS, GARAGE_INDICES } from './config';
import { useAppStore } from './store';

afterEach(() => useAppStore.setState(useAppStore.getInitialState(), true));

it('only pulses existing lamps on a ready car in the intro', () => {
  const state = useAppStore.getState();
  useAppStore.setState({ refs: { ...state.refs, lightPulseT: 0, lamps: [] }, isCarLoading: false });
  const pulse = () => useAppStore.getState().pulseCarLights();
  pulse();
  expect(useAppStore.getState().refs.lightPulseT).toBe(0);
  useAppStore.getState().refs.lamps = [
    { light: new THREE.PointLight(), baseIntensity: 2, isHeadlight: false },
  ];
  for (const blocked of [
    { isCarLoading: true },
    { isCarLoading: false, carLoadError: 'Failed' },
    { carLoadError: null, sectionIndex: 4 },
  ]) {
    useAppStore.setState(blocked);
    pulse();
    expect(useAppStore.getState().refs.lightPulseT).toBe(0);
  }
  useAppStore.setState({ sectionIndex: 0 });
  pulse();
  expect(useAppStore.getState().refs.lightPulseT).toBe(1);
  useAppStore.getState().setCarIndex(1);
  expect(useAppStore.getState().refs.lightPulseT).toBe(0);
});

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
      carIndex: GARAGE_INDICES.at(-1)!,
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
    expect(useAppStore.getState().carIndex).toBe(GARAGE_INDICES.at(-1));
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
    state.refs.bodyMaterial = new THREE.MeshStandardMaterial({ color: CARS[6].defaultPaint.hex });
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

it.each([
  'porsche-917k-lm-red.glb',
  'ferrari-296-gt3.glb',
  'red-bull-rb16b.glb',
  'ferrari-f1-75.glb',
  'corvette-c8r-tf-sport.glb',
])('preserves %s livery through direct paint and keyboard cycling', (file) => {
  const state = useAppStore.getState();
  state.setCarIndex(CARS.findIndex((car) => car.file === file));
  const material = new THREE.MeshStandardMaterial({ color: '#fafafa' });
  const original = material.color.clone();
  state.refs.bodyMaterial = material;
  state.refs.bodyOriginalColor = original;
  state.applyBodyColor('#365d7b');
  expect(material.color).toEqual(original);
  expect(useAppStore.getState().activeBodyColor).toBe('original');
  state.cycleBodyColor();
  expect(material.color).toEqual(original);
  expect(useAppStore.getState().activeBodyColor).toBe('original');
});

it('guards headlight controls while unavailable or loading and resets the next Miata visit', () => {
  const state = useAppStore.getState();
  state.setCarIndex(10);
  state.toggleHeadlights();
  expect(useAppStore.getState().headlightsRaised).toBe(true);
  useAppStore.setState({ hasPopupHeadlights: true, isCarLoading: true });
  state.toggleHeadlights();
  expect(useAppStore.getState().headlightsRaised).toBe(true);
  useAppStore.setState({ isCarLoading: false });
  state.toggleHeadlights();
  expect(useAppStore.getState().headlightsRaised).toBe(false);
  state.setCarIndex(0);
  state.toggleHeadlights();
  expect(useAppStore.getState().headlightsRaised).toBe(true);
  expect(useAppStore.getState().hasPopupHeadlights).toBe(false);
  state.setCarIndex(10);
  expect(useAppStore.getState().headlightsRaised).toBe(true);
});

it('guards DRS while loading or unavailable and resets it on car changes', () => {
  const state = useAppStore.getState();
  state.setCarIndex(16);
  state.toggleDRS();
  expect(useAppStore.getState().drsOpen).toBe(false);
  useAppStore.setState({ hasDRS: true, isCarLoading: true });
  state.toggleDRS();
  expect(useAppStore.getState().drsOpen).toBe(false);
  useAppStore.setState({ isCarLoading: false, carLoadError: 'Could not load' });
  state.toggleDRS();
  expect(useAppStore.getState().drsOpen).toBe(false);
  useAppStore.setState({ carLoadError: null });
  state.toggleDRS();
  expect(useAppStore.getState().drsOpen).toBe(true);
  state.setCarIndex(2);
  expect(useAppStore.getState()).toMatchObject({ drsOpen: false, hasDRS: false });
  useAppStore.setState({ hasDRS: true });
  state.toggleDRS();
  expect(useAppStore.getState().drsOpen).toBe(false);
  state.setCarIndex(15);
  useAppStore.setState({ hasDRS: true, isCarLoading: false });
  state.toggleDRS();
  expect(useAppStore.getState().drsOpen).toBe(true);
  state.randomizeGarage();
  expect(useAppStore.getState()).toMatchObject({ drsOpen: false, hasDRS: false });
  state.toggleDRS();
  expect(useAppStore.getState().drsOpen).toBe(false);
});
