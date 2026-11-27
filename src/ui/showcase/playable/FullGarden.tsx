import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { gardenFlowers, type PlantedFlower } from './gardenFlowers';
import { usePageScrollLock } from '../../usePageScrollLock';
import { FlowerNoteEditor } from './FlowerNoteEditor';
import { Icon } from './StudioIcon';
import './full-garden.css';

export function FullGarden({
  selected,
  choose,
  notes,
  personal,
  returnFocus,
  onClose,
  onPlant,
  onVisitSill,
}: {
  selected: number;
  choose: (index: number) => void;
  notes: string[];
  personal: number[];
  returnFocus: RefObject<HTMLButtonElement>;
  onClose: () => void;
  onPlant: (flower: PlantedFlower) => void;
  onVisitSill: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const write = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [planting, setPlanting] = useState(0);
  const owned = personal.includes(selected);
  usePageScrollLock(true);
  useLayoutEffect(() => {
    const el = dialog.current!;
    const trigger = returnFocus.current;
    el.showModal();
    el.focus({ preventScroll: true });
    return () => {
      el.close();
      trigger?.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  function finishEdit() {
    setEditing(false);
    requestAnimationFrame(() => write.current?.focus({ preventScroll: true }));
  }
  return createPortal(
    <dialog
      ref={dialog}
      className="full-garden"
      tabIndex={-1}
      aria-label="Full garden"
      onCancel={(event) => {
        event.preventDefault();
        if (editing) finishEdit();
        else onClose();
      }}
    >
      <div className="garden-spread">
        <header className="garden-spread-head">
          <h2>{personal.length ? 'Your garden' : 'Sarah’s garden'}</h2>
          <button type="button" onClick={onClose} aria-label="Close garden">
            Close{' '}
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="m3 3 10 10M13 3 3 13" />
            </svg>
          </button>
        </header>
        <div className="garden-letter">
          {editing ? (
            <FlowerNoteEditor
              initial={owned ? notes[selected] : ''}
              onGrow={(note) => {
                onPlant({ index: selected, note });
                setPlanting((version) => version + 1);
                finishEdit();
              }}
              onCancel={finishEdit}
            />
          ) : (
            <>
              <figure aria-live="polite" aria-atomic="true">
                <figcaption>
                  {owned ? 'Your note' : 'Maya’s note for Sarah'} <span aria-hidden="true">/</span>{' '}
                  {gardenFlowers[selected].name}
                </figcaption>
                <blockquote data-long={notes[selected].length > 62}>“{notes[selected]}”</blockquote>
              </figure>
              <div className="garden-actions">
                <button type="button" onClick={onVisitSill}>
                  Bean’s windowsill <Icon name="arrow" size={16} />
                </button>
                <button ref={write} type="button" onClick={() => setEditing(true)}>
                  {owned ? 'Edit your note' : 'Write a note'} <Icon name="pencil" size={14} />
                </button>
              </div>
            </>
          )}
        </div>
        <div className="garden-specimens" role="group" aria-label="Read a flower’s note">
          {gardenFlowers.map((flower, index) => (
            <button
              type="button"
              key={flower.name}
              aria-label={flower.name}
              aria-pressed={index === selected}
              data-place={
                index === selected
                  ? 'focus'
                  : index === (selected + 1) % gardenFlowers.length
                    ? 'far'
                    : 'near'
              }
              onClick={() => {
                choose(index);
                setEditing(false);
              }}
            >
              <span
                key={index === selected ? planting : 0}
                className="garden-specimen-art"
                dangerouslySetInnerHTML={{ __html: flower.art }}
              />
              <span className="garden-specimen-label">{flower.name}</span>
            </button>
          ))}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
