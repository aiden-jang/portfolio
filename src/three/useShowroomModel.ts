import { CARS, DEFAULT_CAR_INDEX } from '../config';
import { useGarageStudio } from '../garageStudio/state';
import { useAppStore } from '../store';

export function useShowroomModel() {
  const garage = useGarageStudio((state) => state.active);
  const carIndex = useAppStore((state) => state.carIndex);
  const modelFile =
    carIndex === DEFAULT_CAR_INDEX && !garage ? 'corvette-opening.glb' : CARS[carIndex].file;
  return { carIndex, modelFile };
}
