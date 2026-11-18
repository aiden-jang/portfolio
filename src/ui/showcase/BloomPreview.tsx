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
}: {
  image: string;
  caption: string;
  states?: PreviewState[];
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
        <div className="bloom-spread-garden">
          <button
            ref={inspect}
            type="button"
            className="bloom-spread-image-trigger"
            aria-label="View full garden"
            onClick={() => setViewer(true)}
          >
            <ScreenshotImage
              src={initialImage}
              alt="Sarah’s received garden in bloomnote, with three illustrated flowers."
              lazy
            />
            <span className="bloom-spread-inspect-label">
              View full garden <ControlIcon name="fit" />
            </span>
          </button>
        </div>
        <figcaption className="bloom-spread-detail">
          <div className="bloom-spread-gerbera" aria-hidden="true" />
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
