import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { THEMES } from '../config';
import { Car } from './Car';
import { CameraRig } from './CameraRig';
import { Effects } from './Effects';
import { Floor } from './Floor';
import { Lights } from './Lights';

type Props = {
  getScrollT: () => number;
};

/** R3F canvas hosting the entire 3D scene. The DOM overlay is rendered as a
 *  sibling in `App`. */
export function Scene({ getScrollT }: Props) {
  return (
    <Canvas
      className="!fixed inset-0 z-0"
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 35, near: 0.1, far: 200, position: [0, 2, 10] }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = THEMES.dusk.exposure;
        gl.setClearColor(THEMES.dusk.bg, 1);
      }}
    >
      <Lights />
      <Floor />
      <Car />
      <CameraRig getScrollT={getScrollT} />
      <Effects />
    </Canvas>
  );
}
