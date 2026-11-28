import { useFinishStudy } from './finishStudy';
import { PhotoCapture } from './PhotoCapture';
import { LoadingBar } from '../ui/LoadingBar';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { F40_INDEX, THEMES } from '../config';
import { Car } from './Car';
import { CameraRig } from './CameraRig';
import { lazy, Suspense } from 'react';
import { Floor } from './Floor';
import { Lights } from './Lights';
import { useAppStore } from '../store';
import { useScenePaused } from './useScenePaused';
import { useSceneActivity } from './useSceneActivity';
import { isOpeningStudio } from '../lighting';
import { StudioRoom } from './studio/StudioRoom';
import { SceneHealth } from './SceneHealth';
import { useGarageStudio } from '../garageStudio/state';
import { StudioRig } from '../garageStudio/StudioRig';
import { useLineup } from '../lineup/state';

const Effects = lazy(() => import('./Effects').then((module) => ({ default: module.Effects })));

const LineupScene = lazy(() =>
  import('../lineup/LineupScene').then((module) => ({
    default: module.LineupScene,
  })),
);

type Props = {
  getScrollT: () => number;
};

export function Scene({ getScrollT }: Props) {
  // Let the F40 download and decode before compiling the showroom and its reflection.
  const loadingInitialF40 = useAppStore(
    (state) => state.carIndex === F40_INDEX && state.isCarLoading && !state.refs.carModel,
  );
  const paused = useScenePaused();
  const active = useSceneActivity();
  const closing = useFinishStudy((state) => state.active);
  const sectionIndex = useAppStore((state) => state.sectionIndex);
  const openingStudio = useAppStore(isOpeningStudio);
  const lineup = useLineup((state) => state.active);
  const garageStudio = useGarageStudio((state) => state.active);
  const studio = openingStudio || lineup || garageStudio;
  return (
    <>
      <Canvas
        aria-hidden="true"
        frameloop={
          loadingInitialF40
            ? 'never'
            : paused || !active || (sectionIndex > 0 && !closing && !lineup && !garageStudio)
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
        <PhotoCapture />
        <Lights />
        {studio && !loadingInitialF40 && <StudioRoom />}
        {lineup ? (
          <Suspense fallback={<Floor studio lineup={null} />}>
            <LineupScene />
          </Suspense>
        ) : (
          !loadingInitialF40 && (
            <Floor studio={studio || closing} closing={closing && !garageStudio} />
          )
        )}
        <Car />
        <CameraRig getScrollT={getScrollT} lineup={lineup || garageStudio} />
        {garageStudio && <StudioRig />}
        <Suspense fallback={null}>{!loadingInitialF40 && <Effects />}</Suspense>
      </Canvas>
      <LoadingBar />
    </>
  );
}
