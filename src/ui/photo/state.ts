import { create } from 'zustand';
import { useAppStore } from '../../store';

export const usePhotoMode = create<{ active: boolean; open: () => void; close: () => void }>(
  (set) => ({
    active: false,
    open: () => {
      const s = useAppStore.getState();
      if (s.sectionIndex === 0 && !s.isCarLoading && !s.carLoadError && !s.sceneUnavailable)
        set({ active: true });
    },
    close: () => set({ active: false }),
  }),
);
