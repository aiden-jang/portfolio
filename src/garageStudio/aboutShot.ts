import { useAppStore } from '../store';
import { useGarageStudy } from '../garageStudy/state';
import { activeOrbit, repaintStudio, selectPose, useGarageStudio } from './state';

let origin: { trigger: HTMLElement; scroll: number } | null = null;

export function openAboutShot(trigger: HTMLElement) {
  origin = { trigger, scroll: window.scrollY };
  const studio = useGarageStudio.getState();
  studio.open();
  studio.selectCar(0);
  useAppStore.setState({ activeBodyColor: 'original' });
  useAppStore.getState().applyBodyColor('original');
  useGarageStudy.setState({ camera: 'orbit', playing: false, refined: true, look: 'studio' });
  const phone = matchMedia('(max-width: 767px)').matches;
  Object.assign(activeOrbit(), { pitch: 0, zoom: phone ? 0.86 : 1 });
  selectPose(2.88);
  useGarageStudio.setState({ guides: false });
  repaintStudio();
}

export function returnToAboutShot() {
  const shot = origin;
  origin = null;
  if (!shot) return false;
  window.scrollTo({ top: shot.scroll, behavior: 'instant' });
  shot.trigger.focus({ preventScroll: true });
  return true;
}
