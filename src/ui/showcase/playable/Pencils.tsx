import type { CSSProperties } from 'react';
import { Icon } from './StudioIcon';
import { inks } from './portrait';

export function Pencils({
  selected,
  select,
}: {
  selected: number;
  select: (index: number, name: string) => void;
}) {
  return (
    <div className="pencils" role="group" aria-label="Pencil color">
      {inks.map((item, index) => (
        <button
          key={item.name}
          type="button"
          className="wood-pencil"
          style={
            {
              '--lead': item.color,
              '--shade': item.dark,
              '--light': item.bright,
              '--index': index,
            } as CSSProperties
          }
          aria-label={`${item.name} pencil`}
          aria-pressed={selected === index}
          onClick={() => select(index, item.name)}
        >
          <span className="pencil-body">
            <span className="pencil-print">{item.name}</span>
            <b />
          </span>
          <span className="pencil-wood" />
          <span className="pencil-point" />
          <span className="pencil-selected">
            <Icon name="tick" size={13} />
          </span>
        </button>
      ))}
    </div>
  );
}

export function DrawingInstructions() {
  return (
    <span className="sr-only" id="keyboard-drawing">
      Choose a pencil to draw freely with a finger, or drag a mouse. With a keyboard, arrow keys
      draw, Space lifts or lowers your pencil, and Backspace undoes a mark.
    </span>
  );
}
