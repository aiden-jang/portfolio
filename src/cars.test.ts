import { afterEach, describe, expect, it, vi } from 'vitest';
import { CARS, GARAGE_INDICES, adjacentCar } from './cars';
import { useAppStore } from './store';
import { buildCommands } from './ui/commands';

afterEach(() => {
  vi.restoreAllMocks();
  useAppStore.setState(useAppStore.getInitialState(), true);
});

describe('curated garage', () => {
  it('retains shared identities while hiding retired cars from selection commands', () => {
    expect(CARS[7].file).toBe('porsche-930-turbo-1975.glb');
    expect(CARS[8].file).toBe('porsche-917k-lm-red.glb');
    expect(CARS[9].file).toBe('bmw-g82-m4-adro.glb');
    expect(CARS[14].file).toBe('ferrari-296-gt3.glb');
    expect(CARS[15].file).toBe('red-bull-rb16b.glb');
    expect(CARS[16].file).toBe('ferrari-f1-75.glb');
    expect(new Set(GARAGE_INDICES).size).toBe(GARAGE_INDICES.length);
    expect(GARAGE_INDICES).not.toContain(7);
    expect(GARAGE_INDICES).not.toContain(8);
    expect(GARAGE_INDICES).not.toContain(14);
    expect(GARAGE_INDICES).toContain(16);
    expect(CARS[16].roadLights).toBe(false);
    expect(CARS[16].preserveFlatMeshes).toBe(true);
    expect(GARAGE_INDICES).toContain(5);
    const commands = buildCommands({ onSection: vi.fn(), setNotice: vi.fn() });
    expect(commands.some(({ id }) => ['car-7', 'car-8', 'car-14'].includes(id))).toBe(false);
  });

  it('cycles every visible car exactly once and reverses the same order', () => {
    let index = GARAGE_INDICES[0];
    const visited: number[] = [];
    for (let i = 0; i < GARAGE_INDICES.length; i++) {
      visited.push(index);
      const next = adjacentCar(index, 1);
      expect(adjacentCar(next, -1)).toBe(index);
      index = next;
    }
    expect(visited).toEqual(GARAGE_INDICES);
    expect(index).toBe(GARAGE_INDICES[0]);
  });

  it('lets an older shared car link rejoin the visible garage in either direction', () => {
    for (const index of [7, 8, 14]) {
      useAppStore.getState().setCarIndex(index);
      expect(useAppStore.getState().carIndex).toBe(index);
      useAppStore.getState().cycleCar();
      expect(useAppStore.getState().carIndex).toBe(GARAGE_INDICES[0]);
      useAppStore.getState().setCarIndex(index);
      useAppStore.getState().prevCar();
      expect(useAppStore.getState().carIndex).toBe(GARAGE_INDICES.at(-1));
    }
  });

  it('surprises visitors with another visible car, including when starting at a retired car', () => {
    for (const source of [7, ...GARAGE_INDICES]) {
      for (const random of [0, 0.5, 0.999999]) {
        useAppStore.getState().setCarIndex(source);
        vi.spyOn(Math, 'random').mockReturnValue(random);
        useAppStore.getState().randomizeGarage();
        const { carIndex, activeBodyColor } = useAppStore.getState();
        expect(GARAGE_INDICES).toContain(carIndex);
        expect(carIndex).not.toBe(source);
        if (CARS[carIndex].fixedLivery) expect(activeBodyColor).toBe('original');
        vi.restoreAllMocks();
      }
    }
  });
});
