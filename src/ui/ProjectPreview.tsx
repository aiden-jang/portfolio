import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = { image: string; name: string; caption: string };

export function ProjectPreview({ image, name, caption }: Props) {
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
          onClick={() => {
            setZoomed(false);
            setOpen(true);
          }}
          aria-label={`Enlarge ${name} screenshot`}
        >
          <img src={image} alt={`${name} product interface`} loading="lazy" />
          <span>Inspect screenshot ↗</span>
        </button>
        <figcaption>{caption}</figcaption>
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
