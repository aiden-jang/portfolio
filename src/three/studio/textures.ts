import * as THREE from 'three';
import { SCENE_ACTIVITY_EVENT } from '../useSceneActivity';

type SurfaceFile = 'concrete.jpg' | 'floor.jpg' | 'plate-mobile.jpg' | 'plate-desktop.jpg';
type SurfaceTexture = { texture: THREE.Texture; ready: { value: number }; settled: boolean };
const textures = new Map<SurfaceFile, SurfaceTexture>();

export function studioTexture(file: SurfaceFile) {
  const cached = textures.get(file);
  if (cached) return cached;
  const ready = { value: 0 };
  const settle = () => {
    surface.settled = true;
    window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT));
  };
  const texture = new THREE.TextureLoader().load(
    '/showroom/studio/' + file,
    () => {
      ready.value = 1;
      settle();
    },
    undefined,
    settle,
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (!file.startsWith('plate-')) texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
  const surface = { texture, ready, settled: false };
  textures.set(file, surface);
  return surface;
}

export function studioSurfacesReady(mobile: boolean) {
  return [
    studioTexture(mobile ? 'plate-mobile.jpg' : 'plate-desktop.jpg'),
    studioTexture('concrete.jpg'),
    studioTexture('floor.jpg'),
  ].every(({ settled }) => settled);
}
