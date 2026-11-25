import { MeshPhysicalMaterial, type Texture } from 'three';
import { CARS, MIATA_BODY_PAINT, MIATA_MODEL } from '../../cars';
import { useAppStore } from '../../store';

export function updateMiataPaintReflection(environment: (() => Texture) | null, intensity: number) {
  const { carIndex, refs } = useAppStore.getState();
  const paint = refs.bodyMaterial;
  if (
    CARS[carIndex].file !== MIATA_MODEL ||
    !(paint instanceof MeshPhysicalMaterial) ||
    paint.name !== MIATA_BODY_PAINT
  )
    return;

  const envMap = environment?.() ?? null;
  paint.envMapIntensity = envMap ? intensity : 1;
  if (Boolean(paint.envMap) !== Boolean(envMap)) paint.needsUpdate = true;
  paint.envMap = envMap;
}
