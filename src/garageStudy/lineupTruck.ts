import { CatmullRomCurve3, Vector3 } from 'three';

type Point = [x: number, y: number, z: number];
const path = (...points: Point[]) =>
  new CatmullRomCurve3(points.map((point) => new Vector3(...point)));

export const truckWide = path(
  [-4.7, 0.58, 3.41],
  [-3.4, 0.54, 4.25],
  [-0.3, 0.72, 5.28],
  [3.5, 0.96, 7.3],
  [5.12, 1.33, 9.1],
);
export const truckPhone = path(
  [-5.31, 0.72, 3.78],
  [-3.9, 0.71, 4.8],
  [-0.34, 0.84, 6.05],
  [4.1, 1.09, 8.6],
  [6.15, 1.97, 13.55],
);
export const truckFocus = path(
  [-2.41, 0.52, 2.35],
  [-1.95, 0.52, 1.54],
  [-0.66, 0.53, 0.44],
  [0.24, 0.61, -0.17],
  [0.07, 0.58, -0.1],
);
