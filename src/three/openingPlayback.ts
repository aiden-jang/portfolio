import { create } from 'zustand';
import { useAppStore } from '../store';
import { smoothScrollTo } from '../hooks/scrollNavigation';
import { SCENE_ACTIVITY_EVENT } from './useSceneActivity';

type Playback = 'off' | 'playing' | 'paused';

export const useOpeningPlayback = create<{ playback: Playback; toggle: () => void }>((set) => ({
  playback: 'off',
  toggle: () => set(({ playback }) => ({ playback: playback === 'paused' ? 'playing' : 'paused' })),
}));

let replayVersion = 0;

export function replayOpeningOrbit() {
  replayVersion++;
  window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT));
}

export function getOpeningReplayVersion() {
  return replayVersion;
}

export function resetShowroomCamera() {
  const state = useAppStore.getState();
  if (state.isCarLoading || state.carLoadError || state.sceneUnavailable) return;
  if (state.sectionIndex !== 0) {
    state.resetCamera();
    return;
  }
  replayOpeningOrbit();
  if (window.scrollY > 1) smoothScrollTo(0);
}
