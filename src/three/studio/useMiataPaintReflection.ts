import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MeshPhysicalMaterial, PMREMGenerator, type WebGLRenderTarget } from 'three';
import { CARS, MIATA_BODY_PAINT, MIATA_MODEL } from '../../cars';
import { inStudioDusk } from '../../garageExhibits/state';
import { inBlackout, useGarageStudio } from '../../garageStudio/state';
import { isOpeningStudio } from '../../lighting';
import { useLineup } from '../../lineup/state';
import { useAppStore } from '../../store';
import { createStudioEnvironment } from './environment';

export function useMiataPaintReflection() {
  const renderer = useThree((state) => state.gl);
  const fixtures = useRef<WebGLRenderTarget | null>(null);

  useEffect(
    () => () => {
      fixtures.current?.dispose();
      fixtures.current = null;
    },
    [renderer],
  );

  useFrame(() => {
    const state = useAppStore.getState();
    const paint = state.refs.bodyMaterial;
    if (
      CARS[state.carIndex].file !== MIATA_MODEL ||
      !(paint instanceof MeshPhysicalMaterial) ||
      paint.name !== MIATA_BODY_PAINT
    )
      return;

    const garage = useGarageStudio.getState();
    const litStudio = garage.active
      ? !inBlackout() && !inStudioDusk(garage)
      : isOpeningStudio(state);
    const active = litStudio && !useLineup.getState().active;
    if (active && !fixtures.current) {
      const generator = new PMREMGenerator(renderer);
      fixtures.current = createStudioEnvironment(generator, 'miata');
      generator.dispose();
    }

    const envMap = active ? (fixtures.current?.texture ?? null) : null;
    if (paint.envMap === envMap) return;
    paint.envMap = envMap;
    paint.envMapIntensity = envMap ? 0.55 : 1;
    paint.needsUpdate = true;
  });
}
