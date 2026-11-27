import anemone from '../../../../studio-art/anemone.svg?raw';
import gerbera from '../../../../studio-art/gerbera.svg?raw';
import ranunculus from '../../../../studio-art/ranunculus.svg?raw';

export const gardenFlowers = [
  { name: 'Anemone', phrase: 'You notice the little things.', art: anemone },
  { name: 'Gerbera', phrase: 'You made a rainy walk feel like home.', art: gerbera },
  { name: 'Ranunculus', phrase: 'You make room for me.', art: ranunculus },
] as const;

export type PlantedFlower = { index: number; note: string; example?: boolean };
