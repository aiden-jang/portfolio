import type { CSSProperties } from 'react';
import { inks } from './portrait';

export function Pencils({
  selected,
  select,
}: {
  selected: number;
  select: (index: number, name: string) => void;
}) {
  return (
    <div className="ink-palette" role="group" aria-label="Pencil color">
      {inks.map((ink, n) => (
        <button
          type="button"
          key={ink.name}
          aria-label={ink.name + ' pencil'}
          title={ink.name}
          aria-pressed={selected === n}
          onClick={() => select(n, ink.name)}
          style={{ '--swatch': ink.color } as CSSProperties}
        >
          <span aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
export function DrawingInstructions() {
  return (
    <span id="keyboard-drawing" className="sr-only">
      Drag to draw. On a phone choose a color to draw in every direction, then tap Done to scroll on
      the canvas. With a keyboard, arrow keys draw, Space lifts the pencil, and Backspace undoes a
      mark.
    </span>
  );
}
