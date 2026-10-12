import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PreviewState } from '../data/projectPreviews';
import './preview-states.css';
import { usePreviewSelection } from './usePreviewSelection';
import { previewIndex, previewLink } from './previewLinks';
import './browsing-polish.css';

type Props = { image: string; name: string; caption: string; states?: PreviewState[] };

export function ProjectPreview({
  image: initialImage,
  name,
  caption: initialCaption,
  states,
}: Props) {
  const [selected, setSelected] = usePreviewSelection(name, states?.length ?? 1);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
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
  useEffect(() => {
    const linked = previewIndex(
      new URLSearchParams(location.search).get('preview'),
      name,
      states?.length ?? 1,
    );
    if (linked === null || location.hash.startsWith('#work/')) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled)
        document
          .querySelector(`[data-project="${name}"]`)
          ?.closest('article')
          ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => {
      cancelled = true;
    };
  }, [name, states]);
  const shareView = async () => {
    try {
      await navigator.clipboard.writeText(previewLink(location.href, name, selected));
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    } catch {
      setCopyStatus('failed');
    }
  };
  return (
    <>
      <figure>
        <button
          ref={trigger}
          type="button"
          className="project-preview"
          data-project={name}
          data-view={selected}
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
        {states && (
          <div className="preview-view-links">
            <button type="button" onClick={() => void shareView()}>
              {copyStatus === 'copied'
                ? 'View link copied ✓'
                : copyStatus === 'failed'
                  ? 'Copy unavailable'
                  : 'Copy view link ↗'}
            </button>
            {copyStatus === 'failed' && (
              <a href={previewLink(location.href, name, selected)}>Open view link ↗</a>
            )}
            {previewIndex(
              new URLSearchParams(location.search).get('preview'),
              name,
              states.length,
            ) !== null && <a href="#sec-intro">Back to portfolio ↑</a>}
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
