import { create } from 'zustand';

export type Exhibit =
  'free' | 'porsche' | 'dusk' | 'cockpit' | 'brakes' | 'wear' | 'wings' | 'lamps' | 'clarity';
export type Lighting = 'studio' | 'dusk' | 'blackout';

export const exhibitNames: Record<Exhibit, string> = {
  free: 'Studio exhibits',
  porsche: 'Porsche Lineup',
  dusk: 'Dusk lighting',
  cockpit: 'Miata cockpit',
  brakes: 'Brake reveal',
  wear: 'Corvette race wear',
  wings: 'Rear wings',
  lamps: 'Pop-up headlights',
  clarity: 'Fine detail',
};

const initial = {
  exhibit: 'free' as Exhibit,
  after: true,
  lighting: 'dusk' as Lighting,
  focus: -1,
  wheelClose: false,
  shot: 0,
  smoothEdges: true,
  pairWingOpen: false,
  aligned: false,
};

export const useGarageExhibit = create(() => initial);
export const resetExhibit = () => useGarageExhibit.setState(initial);

export function inStudioDusk(studio: { active: boolean; chapter: string }) {
  const { exhibit, lighting } = useGarageExhibit.getState();
  return studio.active && studio.chapter === 'light' && exhibit === 'dusk' && lighting === 'dusk';
}
