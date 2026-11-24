import { create } from 'zustand';
import { useAppStore } from '../../store';

type PhotoState = {
  active: boolean;
  opener: HTMLButtonElement | null;
  open: (opener?: HTMLButtonElement) => void;
  close: () => void;
};

export const usePhotoMode = create<PhotoState>((set) => ({
  active: false,
  opener: null,
  open: (opener) => {
    const s = useAppStore.getState();
    if (s.sectionIndex === 0 && !s.isCarLoading && !s.carLoadError && !s.sceneUnavailable)
      set({ active: true, opener: opener ?? null });
  },
  close: () => set({ active: false, opener: null }),
}));
