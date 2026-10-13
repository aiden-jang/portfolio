import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ScreenshotImage } from './ScreenshotImage';

type Props = {
  image: string;
  name: string;
  caption: string;
  returnFocus: HTMLElement | null;
  onClose: () => void;
  onShare?: () => void;
  shareStatus?: 'idle' | 'copied' | 'failed';
  viewLink?: string;
};

export function ScreenshotViewer({
  image,
  name,
  caption,
  returnFocus,
  onClose,
  onShare,
  shareStatus,
  viewLink,
}: Props) {
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    const ownsLock = overflow !== 'hidden';
    if (ownsLock) root.style.overflow = 'hidden';
    return () => {
      if (ownsLock) root.style.overflow = overflow;
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  useEffect(() => {
    const area = viewport.current;
    if (area)
      area.scrollTo({ left: zoomed ? (area.scrollWidth - area.clientWidth) / 2 : 0, top: 0 });
  }, [zoomed]);
  return createPortal(
    <dialog
      ref={dialog}
      className="preview-dialog"
      aria-label={`${name} screenshot`}
      onKeyDown={(event) => event.stopPropagation()}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="preview-dialog-heading">
        <span>{name}</span>
        {onShare && (
          <button type="button" onClick={onShare}>
            {shareStatus === 'copied'
              ? 'Link copied ✓'
              : shareStatus === 'failed'
                ? 'Copy unavailable'
                : 'Copy view link'}
          </button>
        )}
        {shareStatus === 'failed' && viewLink && <a href={viewLink}>Open view link ↗</a>}
        <button type="button" aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>
          {zoomed ? 'Fit image' : 'Zoom in'}
        </button>
        <button type="button" autoFocus onClick={onClose} aria-label="Close screenshot">
          Close ×
        </button>
      </div>
      <div
        ref={viewport}
        className={`preview-image ${zoomed ? 'is-zoomed' : ''}`}
        tabIndex={zoomed ? 0 : -1}
        role="region"
        aria-label="Screenshot. Scroll to explore the enlarged image."
      >
        <ScreenshotImage
          key={image}
          src={image}
          alt={`${name} product interface, full screenshot`}
        />
      </div>
      <p>
        {zoomed && (
          <span className="preview-zoom-help">Scroll to explore · Fit image to return</span>
        )}
        {caption}
      </p>
    </dialog>,
    document.body,
  );
}
