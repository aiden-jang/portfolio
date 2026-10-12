import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PreviewState } from '../data/projectPreviews';
import './preview-states.css';

type Props = { image: string; name: string; caption: string; states?: PreviewState[] };

export function ProjectPreview({
  image: initialImage,
  name,
  caption: initialCaption,
  states,
}: Props) {
  const [selected, setSelected] = useState(0);
  const image = states?.[selected]?.image ?? initialImage;
  const caption = states?.[selected]?.caption ?? initialCaption;
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const focusTarget = trigger.current;
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = overflow;
      focusTarget?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <>
      <figure>
        <button
          ref={trigger}
          type="button"
          className="project-preview"
          data-project={name}
          onClick={() => {
            setZoomed(false);
            setOpen(true);
          }}
          aria-label={`Enlarge ${name} screenshot`}
        >
          <div className="preview-thumbnail">
            <img src={image} alt={`${name} product interface`} loading="lazy" />
          </div>
          <span>Inspect screenshot ↗</span>
        </button>
        {states && (
          <div className="preview-states" role="group" aria-label={`${name} product views`}>
            {states.map((state, index) => (
              <button
                key={state.label}
                type="button"
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                {state.label}
              </button>
            ))}
          </div>
        )}
        <figcaption aria-live="polite">{caption}</figcaption>
      </figure>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="preview-dialog"
            aria-label={`${name} screenshot`}
            onCancel={() => setOpen(false)}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div className="preview-dialog-heading">
              <span>{name}</span>
              <button type="button" aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>
                {zoomed ? 'Fit image' : 'Zoom in'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                aria-label="Close screenshot"
              >
                Close ×
              </button>
            </div>
            <div className={`preview-image ${zoomed ? 'is-zoomed' : ''}`}>
              <img src={image} alt={`${name} product interface, full screenshot`} />
            </div>
            <p>{caption}</p>
          </dialog>,
          document.body,
        )}
    </>
  );
}
