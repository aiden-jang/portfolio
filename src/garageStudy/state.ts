import type { Lighting } from '../garageExhibits/state';
import { create } from 'zustand';

export type StudyCamera = 'orbit' | 'profile' | 'deck' | 'glide' | 'wheel';
export type StudioLighting = Lighting | 'night';

export const useGarageStudy = create(() => ({
  refined: true,
  camera: 'orbit' as StudyCamera,
  playing: false,
  look: null as StudioLighting | null,
}));

export const track = {
  position: 0,
  entry: 1,
  fromX: 0,
  fromY: 0,
  fromZ: 0,
  fromFov: 42,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
};

export function startLineupGlide() {
  track.position = 0;
  track.entry = 1;
  useGarageStudy.setState({ camera: 'glide', playing: true });
}

export function resetStudyCamera() {
  useGarageStudy.setState({ camera: 'orbit', playing: false });
}
