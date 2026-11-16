import { LoadingBar } from '../ui/LoadingBar';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SECTION_IDS, THEMES } from '../config';
import { Car } from './Car';
import { CameraRig } from './CameraRig';
import { lazy, Suspense } from 'react';
import { Floor } from './Floor';
import { Lights } from './Lights';
import { useAppStore } from '../store';
import { useScenePaused } from './useScenePaused';
import { useSceneActivity } from './useSceneActivity';
import { SceneHealth } from './SceneHealth';

const Effects = lazy(() => import('./Effects').then((module) => ({ default: module.Effects })));

type Props = {
  getScrollT: () => number;
};

export function Scene({ getScrollT }: Props) {
  const paused = useScenePaused();
  const active = useSceneActivity();
  const contactVisible = useAppStore((state) => state.isContactVisible);
  const sectionIndex = useAppStore((state) => state.sectionIndex);
  return (
    <>
      <Canvas
        aria-hidden="true"
        frameloop={
          paused ||
          !active ||
          (sectionIndex > 0 && sectionIndex < SECTION_IDS.length - 1 && !contactVisible)
            ? 'demand'
            : 'always'
        }
        className="portfolio-scene !fixed inset-0 z-0"
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 35, near: 0.1, far: 200, position: [0, 2, 10] }}
        onCreated={({ gl }) => {
          gl.debug.checkShaderErrors = import.meta.env.DEV;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = THEMES.dusk.exposure;
          gl.setClearColor(THEMES.dusk.bg, 1);
        }}
      >
        <SceneHealth />
        <Lights />
        <Floor />
        <Car />
        <CameraRig getScrollT={getScrollT} />
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      </Canvas>
      <LoadingBar />
    </>
  );
}
