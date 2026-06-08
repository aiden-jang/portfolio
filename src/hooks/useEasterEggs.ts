import { useEffect } from 'react';
import { useAppStore } from '../store';

const RESET_AFTER_MS = 1200;
const BUFFER_SIZE = 12;

const COLOR_PALETTE = [
  '#ff6b1c', // signal orange
  '#b00020', // crimson
  '#0a0a0c', // gloss black
  '#f5f1e8', // pearl white
  '#194527', // racing green
  '#163a8a', // royal blue
];

/** Listens to typed keys (anywhere outside form fields) and fires fun actions
 *  when the buffer ends with a known keyword. Keystrokes more than 1.2s apart
 *  reset the buffer. */
export function useEasterEggs() {
  useEffect(() => {
    let buffer = '';
    let lastKeyMs = 0;

    const eggs: Record<string, () => void> = {
      rev: () => useAppStore.getState().triggerRev(),
      next: () => useAppStore.getState().cycleCar(),
      car: () => useAppStore.getState().cycleCar(),
      night: () => {
        if (useAppStore.getState().themeName !== 'night') {
          useAppStore.getState().toggleTheme();
        }
      },
      day: () => {
        if (useAppStore.getState().themeName !== 'dusk') {
          useAppStore.getState().toggleTheme();
        }
      },
      color: () => {
        const refs = useAppStore.getState().refs;
        const mat = refs.bodyMaterial;
        if (!mat?.color) return;
        // Pick any color other than the current one for guaranteed visible change.
        const currentHex = '#' + mat.color.getHexString();
        const choices = COLOR_PALETTE.filter((c) => c.toLowerCase() !== currentHex);
        mat.color.set(choices[Math.floor(Math.random() * choices.length)]);
      },
      wow: () => {
        // Reuse the section-punch by faking a section change: bump index, then
        // immediately bump it back. Cheaper than dedicated state.
        const s = useAppStore.getState();
        const prev = s.sectionIndex;
        s.setSectionIndex(prev === 0 ? 1 : prev - 1);
        setTimeout(() => s.setSectionIndex(prev), 16);
      },
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept while user types in a form field.
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key.length !== 1) return; // ignore Shift, arrows, etc.

      const now = performance.now();
      if (now - lastKeyMs > RESET_AFTER_MS) buffer = '';
      lastKeyMs = now;

      buffer = (buffer + e.key.toLowerCase()).slice(-BUFFER_SIZE);
      for (const word of Object.keys(eggs)) {
        if (buffer.endsWith(word)) {
          eggs[word]();
          buffer = '';
          break;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
