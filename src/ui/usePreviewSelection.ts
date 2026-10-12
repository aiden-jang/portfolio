import { useSyncExternalStore } from 'react';
import { previewIndex } from './previewLinks';

const selections = new Map<string, number>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function usePreviewSelection(name: string, count: number) {
  const read = () => {
    const remembered = selections.get(name);
    if (remembered !== undefined) return remembered < count ? remembered : 0;
    const linked = previewIndex(new URLSearchParams(location.search).get('preview'), name, count);
    if (linked !== null) return linked;
    try {
      const value = Number(sessionStorage.getItem(`preview:${name}`));
      return Number.isInteger(value) && value >= 0 && value < count ? value : 0;
    } catch {
      return 0;
    }
  };
  const selected = useSyncExternalStore(subscribe, read, () => 0);
  const select = (index: number) => {
    selections.set(name, index);
    try {
      sessionStorage.setItem(`preview:${name}`, String(index));
    } catch {
      /* Memory still works. */
    }
    listeners.forEach((listener) => listener());
  };
  return [selected, select] as const;
}
