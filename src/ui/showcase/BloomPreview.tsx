import { useEffect, useRef, useState } from 'react';
import { GerberaHead as BotanicalHead } from './GerberaHead';
import { ScreenshotImage } from '../ScreenshotImage';
import { ScreenshotViewer } from '../ScreenshotViewer';
import type { PreviewState } from '../../data/projectPreviews';
import { usePreviewSelection } from '../usePreviewSelection';
import { previewIndex, previewLink } from '../previewLinks';
import { copyText } from '../../browserSharing';
import { useShareFeedback } from '../useShareFeedback';
const flower = {
  artVersion: 2 as const,
  name: 'Gerbera',
  meaning: 'For that brilliant laugh that comes from deep inside, especially at your own jokes.',
  petalColors: ['#ef7b76', '#ffba84', '#f7a3b8'] as [string, string, string],
  centerColor: '#e7ba46',
  stemColor: '#64845d',
  petalShape: 'elongated' as const,
  petalCount: 16,
  stemHeight: 100,
};
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
  const [open, setOpen] = useState(false),
    [viewer, setViewer] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null),
    inspect = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  };
  return (
    <>
      <figure className="bloom-preview">
        <div className="project-preview" data-project="bloomnote" data-view={selected}>
          <div className="preview-thumbnail">
            <ScreenshotImage src={image} alt="bloomnote example garden" lazy />
          </div>
          <button
            ref={trigger}
            type="button"
            className="bloom-meaning-trigger"
            aria-label="Open Gerbera’s meaning"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <svg viewBox="-48 -48 96 96" aria-hidden="true">
              <BotanicalHead flower={flower} />
            </svg>
            <span>Open a flower</span>
          </button>
          <button
            ref={inspect}
            className="bloom-inspect"
            type="button"
            aria-label="Inspect screenshot: bloomnote"
            onClick={() => setViewer(true)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" />
            </svg>
          </button>
          {open && (
            <div
              className="bloom-meaning"
              role="region"
              aria-label="Gerbera meaning"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  close();
                }
              }}
            >
              <svg viewBox="-48 -48 96 96" aria-hidden="true">
                <BotanicalHead flower={flower} />
              </svg>
              <div>
                <h4>Gerbera</h4>
                <p>{flower.meaning}</p>
              </div>
              <button type="button" onClick={close} autoFocus aria-label="Close flower meaning">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <figcaption>Example meaning from the approved garden.</figcaption>
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
