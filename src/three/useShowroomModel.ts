import { CARS, DEFAULT_CAR_INDEX, F40_INDEX, SECTION_IDS } from '../config';
import { useGarageStudio } from '../garageStudio/state';
import { useLineup } from '../lineup/state';
import { useAppStore } from '../store';

const ABOUT_INDEX = SECTION_IDS.indexOf('sec-about');

export function useShowroomModel() {
  const garage = useGarageStudio((state) => state.active);
  const lineup = useLineup((state) => state.active);
  // Load the fixed closing car behind About, before Contact reveals the scene.
  const carIndex = useAppStore((state) =>
    !garage && !lineup && (state.isContactVisible || state.sectionIndex >= ABOUT_INDEX)
      ? F40_INDEX
      : state.carIndex,
  );
  const modelFile =
    carIndex === DEFAULT_CAR_INDEX && !garage ? 'corvette-opening.glb' : CARS[carIndex].file;
  return { carIndex, modelFile };
}
