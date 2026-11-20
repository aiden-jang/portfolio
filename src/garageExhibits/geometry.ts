import { Box3, type Vector3 } from 'three';

export const pairFrame = {
  bounds: new Box3(),
  cars: [] as Box3[],
};

export const exhibitWheel = {
  point: null as Vector3 | null,
  marker: null as HTMLButtonElement | null,
};
