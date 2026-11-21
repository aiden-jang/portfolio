import { CARS } from '../config';
import { exhibitNames, useGarageExhibit } from '../garageExhibits/state';
import { useGarageStudy } from '../garageStudy/state';
import { chapters, type Chapter } from './state';

export function studioPrintDetails(id: number, chapter: Chapter, car: string) {
  const { exhibit, louvers, after } = useGarageExhibit.getState();
  const camera = useGarageStudy.getState().camera;
  const view = louvers
    ? 'Rear louvers'
    : exhibit === 'free'
      ? chapters[chapter]
      : exhibitNames[exhibit];
  const authors = (
    chapter !== 'lineup'
      ? [id]
      : exhibit === 'porsche' && after
        ? [7, 3]
        : exhibit === 'wings'
          ? [15, 16]
          : [0, 15]
  )
    .map((index) => CARS[index].credit?.author)
    .filter(Boolean);
  return {
    car,
    view: camera === 'orbit' ? view : view + ' · ' + camera,
    credit: authors.length
      ? 'Models by ' + [...new Set(authors)].join(' and ')
      : 'Aiden Jang · Garage Studio',
  };
}
