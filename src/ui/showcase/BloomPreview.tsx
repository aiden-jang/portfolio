import { useEffect, useRef, useState } from 'react';
import { ScreenshotImage } from '../ScreenshotImage';
import { ScreenshotViewer } from '../ScreenshotViewer';
import type { PreviewState } from '../../data/projectPreviews';
import { usePreviewSelection } from '../usePreviewSelection';
import { previewIndex, previewLink } from '../previewLinks';
import { copyText } from '../../browserSharing';
import { useShareFeedback } from '../useShareFeedback';
import { ControlIcon } from '../ControlIcon';
import './bloom-spread.css';

export function BloomPreview({
  image: initialImage,
  caption: initialCaption,
  states,
  onRead,
}: {
  image: string;
  caption: string;
  states?: PreviewState[];
  onRead?: (trigger: HTMLElement) => void;
}) {
  useEffect(() => {
    const linked = previewIndex(
      new URLSearchParams(location.search).get('preview'),
      'bloomnote',
      states?.length ?? 1,
    );
    if (linked === null || location.hash.startsWith('#work/')) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled)
        document
          .getElementById('project-bloomnote')
          ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => {
      cancelled = true;
    };
  }, [states]);
  const [selected, setSelected] = usePreviewSelection('bloomnote', states?.length ?? 1);
  const { result, run } = useShareFeedback(`bloomnote:${selected}`);
  const image = states?.[selected]?.image ?? initialImage;
  const caption = states?.[selected]?.caption ?? initialCaption;
  const [viewer, setViewer] = useState(false);
  const inspect = useRef<HTMLButtonElement>(null);
  return (
    <>
      <figure className="bloom-spread-paper" data-project="bloomnote" data-view={selected}>
        <div className="bloom-spread-garden story-photo-card">
          <button
            type="button"
            className="bloom-spread-image-trigger"
            data-story-source="bloomnote"
            aria-label="Read the bloomnote case study from the garden image"
            onClick={(event) => (onRead ? onRead(event.currentTarget) : setViewer(true))}
          >
            <ScreenshotImage
              src={initialImage}
              alt="Sarah’s received garden in bloomnote, with three illustrated flowers."
              lazy
            />
            <span className="story-photo-read">Read the case study</span>
          </button>
          <button
            ref={inspect}
            type="button"
            className="bloom-spread-inspect-label"
            onClick={() => setViewer(true)}
          >
            View full garden <ControlIcon name="fit" />
          </button>
        </div>
        <figcaption className="bloom-spread-detail">
          {onRead ? (
            <button
              type="button"
              className="bloom-spread-gerbera"
              aria-label="Read about the Gerbera"
              onClick={(event) => onRead(event.currentTarget)}
            />
          ) : (
            <div className="bloom-spread-gerbera" aria-hidden="true" />
          )}
          <div>
            <p className="bloom-spread-species">Gerbera</p>
            <blockquote>
              “For that brilliant laugh that comes from deep inside, especially at your own jokes.”
            </blockquote>
          </div>
        </figcaption>
      </figure>
      {viewer && (
        <ScreenshotViewer
          image={image}
          name="bloomnote"
          caption={caption}
          returnFocus={inspect.current}
          onClose={() => setViewer(false)}
          onShare={
            states
              ? () => {
                  void run(() => copyText(previewLink(location.href, 'bloomnote', selected)));
                }
              : undefined
          }
          shareStatus={result === 'copied' || result === 'failed' ? result : 'idle'}
          viewLink={previewLink(location.href, 'bloomnote', selected)}
          navigation={
            states && states.length > 1
              ? {
                  index: selected,
                  count: states.length,
                  label: states[selected]!.label,
                  onSelect: setSelected,
                }
              : undefined
          }
        />
      )}
    </>
  );
}
