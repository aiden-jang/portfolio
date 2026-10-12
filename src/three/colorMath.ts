import * as THREE from 'three';

const _src = new THREE.Color();
const _dst = new THREE.Color();
export const smoothColorHex = (current: number, target: number, k: number): number => {
  _src.setHex(current);
  _dst.setHex(target);
  _src.lerp(_dst, k);
  return _src.getHex();
};
