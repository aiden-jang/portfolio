import { activeOrbit, repaintStudio, selectPose, useGarageStudio } from '../garageStudio/state';
import { useGarageStudy } from '../garageStudy/state';
import { useAppStore } from '../store';
import { useGarageExhibit, type Exhibit } from './state';

export const wingViews = ['F40 deck', 'RB16B wing', 'Race pairing'] as const;
export const clarityViews = ['F40 slats', 'RWB spokes', 'Corvette lettering'] as const;
export type MechanicalExhibit = 'wings' | 'lamps' | 'clarity';
export function isMechanical(exhibit: Exhibit): exhibit is MechanicalExhibit {
  return exhibit === 'wings' || exhibit === 'lamps' || exhibit === 'clarity';
}

export function selectMechanical(exhibit: MechanicalExhibit, shot = 0) {
  const garage = useGarageStudio.getState();
  const rearPair = exhibit === 'wings' && shot === 2;
  const singleWing = exhibit === 'wings' && shot === 1;
  const chapter = rearPair ? 'lineup' : singleWing || exhibit === 'lamps' ? 'detail' : 'walk';
  garage.select(chapter);
  if (!rearPair) {
    garage.selectCar(exhibit === 'lamps' ? 10 : singleWing ? 15 : [0, 3, 20][shot]);
  }
  useGarageExhibit.setState({ exhibit, shot, smoothEdges: true, pairWingOpen: false });
  useGarageStudy.setState({
    camera: chapter === 'walk' && shot === 0 ? 'deck' : 'orbit',
    playing: false,
  });
  useGarageStudio.setState({ proposed: !rearPair });
  if (exhibit === 'lamps') useAppStore.setState({ headlightsRaised: false });
  if (singleWing) useAppStore.setState({ drsOpen: false });
  activeOrbit().zoom = 1;
  selectPose(
    exhibit === 'wings'
      ? shot === 0
        ? 2.78
        : 3.04
      : exhibit === 'lamps'
        ? 0.54
        : [2.78, 0.96, 0.71][shot],
  );
}

export function alignPorsches(aligned: boolean) {
  useGarageExhibit.setState({ aligned, after: true, focus: -1 });
  useGarageStudio.setState({ proposed: aligned, guides: aligned });
  if (aligned) {
    activeOrbit().zoom = 1;
    selectPose(0.04);
  } else repaintStudio();
}
