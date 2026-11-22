import { create } from 'zustand';

type Playback = 'off' | 'playing' | 'paused';

export const useOpeningPlayback = create<{ playback: Playback; toggle: () => void }>((set) => ({
  playback: 'off',
  toggle: () => set(({ playback }) => ({ playback: playback === 'paused' ? 'playing' : 'paused' })),
}));
