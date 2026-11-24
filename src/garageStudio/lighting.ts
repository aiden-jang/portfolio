import { useGarageStudy, type StudioLighting } from '../garageStudy/state';
import type { Exhibit } from '../garageExhibits/state';
import { isOpeningLowLight, isOpeningStudio } from '../lighting';
import type { ThemeName } from '../types';
import type { useGarageStudio } from './state';

type StudioView = Pick<ReturnType<typeof useGarageStudio.getState>, 'active' | 'chapter' | 'study'>;

export function usesVehicleLampPreset(
  app: Parameters<typeof isOpeningStudio>[0],
  studio: StudioView,
  exhibit: Exhibit,
) {
  if (app.isContactVisible || app.renderFinish) return false;
  if (!studio.active) return isOpeningStudio(app);
  const look = useGarageStudy.getState().look;
  return (
    studio.chapter === 'walk' &&
    exhibit === 'free' &&
    (!studio.study || studio.study === 'finished') &&
    look !== 'dusk' &&
    look !== 'blackout'
  );
}

export function isGarageAfterHours(
  theme: ThemeName,
  studio: StudioView,
  look: StudioLighting | null,
) {
  return (
    studio.active &&
    studio.chapter === 'walk' &&
    (!studio.study || studio.study === 'finished') &&
    (look ?? theme) === 'night'
  );
}

export function isAfterHoursScene(
  app: Parameters<typeof isOpeningLowLight>[0],
  studio: StudioView,
) {
  if (app.isContactVisible || app.renderFinish) return false;
  return studio.active
    ? isGarageAfterHours(app.themeName, studio, useGarageStudy.getState().look)
    : isOpeningLowLight(app);
}

export function saveStudioLighting(
  params: URLSearchParams,
  theme: ThemeName,
  studio: StudioView,
  look: StudioLighting | null,
) {
  params.set('light', 'studio');
  const preset = isGarageAfterHours(theme, studio, look) ? 'night' : look;
  if (preset) params.set('studioLook', preset);
  else params.delete('studioLook');
}

export function parseStudioLighting(look: string | null, chapter: StudioView['chapter']) {
  if (look === 'studio' || look === 'dusk' || look === 'blackout') return look;
  return chapter === 'walk' && look === 'night' ? look : null;
}
