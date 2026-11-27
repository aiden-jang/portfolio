import { create } from 'zustand';
import { clamp } from '../math';

export const finishStudyStart = 0.16;
export const finishStudySpan = 0.76;
export const finishStudyMotion = '(prefers-reduced-motion: no-preference) and (min-height: 500px)';

export const useFinishStudy = create<{ active: boolean; recorded: boolean }>(() => ({
  active: false,
  recorded: false,
}));
export const finishStudyFrame = { progress: 0, top: 0 };

export function finishStudyProgress(top: number, travel: number) {
  return clamp((-top / Math.max(1, travel) - finishStudyStart) / finishStudySpan, 0, 1);
}
