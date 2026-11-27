import type { ReactNode } from 'react';
import { Icon } from './StudioIcon';
import { Pencils } from './Pencils';

export function DrawingControls({
  title,
  link,
  marked,
  guess,
  keyboard,
  freeTouch,
  selected,
  select,
  done,
  undo,
  hang,
}: {
  title: ReactNode;
  link: ReactNode;
  marked: boolean;
  guess: string;
  keyboard: boolean;
  freeTouch: boolean;
  selected: number;
  select: (ink: number, name: string) => void;
  done: () => void;
  undo: () => void;
  hang: () => void;
}) {
  return (
    <>
      <header className="ink-mast">
        <h2 id="studio-desk-title" tabIndex={-1}>
          {title}
        </h2>
        {link}
      </header>
      <footer className="ink-footer">
        <div className="ink-answer">
          <p className="ink-guess" aria-live="polite">
            {marked ? guess || 'One more stroke…' : 'Draw for Bean.'}
          </p>
          <p className="ink-hint">
            {keyboard ? (
              'Arrows draw · Space lifts the pencil'
            ) : (
              <>
                <span className="mouse-hint">I’ll guess as you draw.</span>
                <span className="finger-hint">
                  {freeTouch ? 'Draw anywhere with your finger.' : 'Choose a color to draw.'}
                </span>
              </>
            )}
          </p>
          {freeTouch && (
            <button type="button" className="ink-done" onClick={done}>
              Done
            </button>
          )}
        </div>
        <div className="ink-tools">
          <Pencils selected={selected} select={select} />
          <button
            type="button"
            className="ink-undo"
            aria-label="Undo last mark"
            onClick={undo}
            disabled={!marked}
          >
            <Icon name="undo" size={16} />
            <span>Undo</span>
          </button>
        </div>
        <button type="button" className="ink-hang" onClick={hang}>
          Hang my drawing <Icon name="arrow" size={17} />
        </button>
      </footer>
    </>
  );
}
