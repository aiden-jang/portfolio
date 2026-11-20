import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ScreenshotImage } from './ScreenshotImage';
import { ControlIcon } from './ControlIcon';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { frameFromTrigger } from './triggerMotion';
import './screenshot-viewer.css';

type Props = {
  image: string;
  name: string;
  caption: string;
  returnFocus: HTMLElement | null;
  onClose: () => void;
  onShare?: () => void;
  shareStatus?: 'idle' | 'copied' | 'failed';
  viewLink?: string;
  editorDetail?: boolean;
  navigation?: { index: number; count: number; label: string; onSelect: (index: number) => void };
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
  editorDetail = false,
  navigation,
}: Props) {
  const [zoomed, setZoomed] = useState(editorDetail);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const onReady = useCallback(
    () => setFailedImage((current) => (current === image ? null : current)),
    [image],
  );
  const onUnavailable = useCallback(() => {
    setFailedImage(image);
    setZoomed(false);
  }, [image]);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = dialog.current;
    panel?.showModal();
    closeButton.current?.focus({ preventScroll: true });
    const from = !prefersReducedMotion() && frameFromTrigger(panel, returnFocus, 0.14, 48, 0.925);
    const animation =
      from &&
      panel?.animate?.([from, { opacity: 1, transform: 'translate(0, 0) scale(1)' }], {
        duration: 320,
        easing: 'cubic-bezier(.16,1,.3,1)',
      });
    const root = document.documentElement;
    const overflow = root.style.overflow;
    const ownsLock = overflow !== 'hidden';
    if (ownsLock) root.style.overflow = 'hidden';
    return () => {
      if (animation) animation.cancel();
      if (ownsLock) root.style.overflow = overflow;
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  useEffect(() => {
    const area = viewport.current;
    if (!area) return;
    if (editorDetail && zoomed) {
      area.scrollTo({
        left: area.scrollWidth * (area.clientWidth < 510 ? 0.2 : 0.173),
        top: 0.416 * area.scrollHeight,
      });
      return;
    }
    area.scrollTo({ left: zoomed ? (area.scrollWidth - area.clientWidth) / 2 : 0, top: 0 });
  }, [zoomed, image, editorDetail]);
  return createPortal(
    <dialog
      ref={dialog}
      className={`preview-dialog${editorDetail ? ' preview-dialog-editor' : ''}`}
      aria-label={`${name} screenshot`}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (!navigation || zoomed || event.altKey || event.ctrlKey || event.metaKey) return;
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        navigation.onSelect((navigation.index + step + navigation.count) % navigation.count);
      }}
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
        <div className="preview-dialog-actions">
          {onShare && (
            <button type="button" className="preview-copy" onClick={onShare}>
              <span className="preview-action-label">
                {shareStatus === 'copied'
                  ? 'Link copied'
                  : shareStatus === 'failed'
                    ? 'Copy unavailable'
                    : 'Copy view link'}
              </span>
              <ControlIcon
                name={shareStatus === 'copied' ? 'check' : 'copy'}
                className="preview-action-icon"
              />
            </button>
          )}
          {shareStatus === 'failed' && viewLink && <a href={viewLink}>Open view link ↗</a>}
          <button
            type="button"
            disabled={failedImage === image}
            aria-pressed={zoomed}
            onClick={() => setZoomed(!zoomed)}
          >
            <span className="preview-action-label">{zoomed ? 'Fit image' : 'Zoom in'}</span>
            <ControlIcon name={zoomed ? 'fit' : 'zoom'} className="preview-action-icon" />
          </button>
        </div>
        <button
          type="button"
          className="preview-dialog-close"
          ref={closeButton}
          onClick={onClose}
          aria-label="Close screenshot"
        >
          <span className="preview-action-label">Close ×</span>
          <ControlIcon name="close" className="preview-action-icon" />
        </button>
      </div>
      {navigation && (
        <div className="preview-view-navigation" role="group" aria-label="Screenshot views">
          <button
            type="button"
            onClick={() =>
              navigation.onSelect((navigation.index - 1 + navigation.count) % navigation.count)
            }
          >
            ← Previous
          </button>
          <span aria-live="polite">
            {navigation.index + 1} / {navigation.count} · {navigation.label}
          </span>
          <button
            type="button"
            onClick={() => navigation.onSelect((navigation.index + 1) % navigation.count)}
          >
            Next →
          </button>
        </div>
      )}
      <div
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label={`${name} screenshot image`}
        className={`preview-image ${zoomed ? (editorDetail ? 'is-editor-detail' : 'is-zoomed') : ''}`}
      >
        <ScreenshotImage
          key={image}
          src={image}
          alt={`${name} product interface, full screenshot`}
          onUnavailable={onUnavailable}
          onReady={onReady}
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
