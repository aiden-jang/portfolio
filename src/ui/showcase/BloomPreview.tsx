import { useEffect, useRef, useState } from 'react';
import { ControlIcon } from '../ControlIcon';
import { ScreenshotViewer } from '../ScreenshotViewer';
import type { PreviewState } from '../../data/projectPreviews';
import { usePreviewSelection } from '../usePreviewSelection';
import { previewIndex, previewLink } from '../previewLinks';
import { copyText } from '../../browserSharing';
import { useShareFeedback } from '../useShareFeedback';
import './bloom-garden.css';

const flowers = [
  {
    name: 'Anemone',
    image: '/projects/bloomnote/anemone.svg',
    meaning:
      'For the thoughtful way you keep a tide journal, noticing the small, important rhythms.',
  },
  {
    name: 'Gerbera',
    image: '/projects/bloomnote/gerbera.svg',
    meaning: 'For that brilliant laugh that comes from deep inside, especially at your own jokes.',
  },
  {
    name: 'Ranunculus',
    image: '/projects/bloomnote/ranunculus.svg',
    meaning: 'For existing so wonderfully, no notes on anything you do or say.',
  },
] as const;

export function BloomPreview({
  image: initialImage,
  caption: initialCaption,
  states,
  description,
  url,
  onRead,
}: {
  image: string;
  caption: string;
  states?: PreviewState[];
  description: string;
  url?: string;
  onRead: (trigger: HTMLElement) => void;
}) {
  const [selected, select] = useState(1);
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
  const [view, setView] = usePreviewSelection('bloomnote', states?.length ?? 1);
  const { result, run } = useShareFeedback(`bloomnote:${view}`);
  const image = states?.[view]?.image ?? initialImage;
  const caption = states?.[view]?.caption ?? initialCaption;
  const [showGarden, setShowGarden] = useState(false);
  const inspector = useRef<HTMLButtonElement>(null);
  const flower = flowers[selected];
  return (
    <article id="project-bloomnote" className="bloom-garden" aria-labelledby="bloom-garden-title">
      <div className="bloom-garden-inner">
        <header className="bloom-garden-heading">
          <h3 id="bloom-garden-title">bloomnote</h3>
          <p>{description}</p>
        </header>

        <div className="bloom-garden-scene">
          <figure className="bloom-garden-letter" aria-live="polite" aria-atomic="true">
            <figcaption>{flower.name}</figcaption>
            <blockquote key={flower.name}>“{flower.meaning}”</blockquote>
            <p>A garden from Maya to Sarah</p>
          </figure>
          <div className="bloom-garden-plot" role="group" aria-label="Flowers in Sarah’s garden">
            {flowers.map((item, index) => (
              <button
                key={item.name}
                type="button"
                className={'bloom-garden-flower bloom-garden-flower-' + index}
                aria-pressed={index === selected}
                onClick={() => select(index)}
              >
                <span className="bloom-garden-plant">
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="bloom-garden-name">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <footer className="bloom-garden-actions">
          <button
            type="button"
            aria-label="How I built it: bloomnote"
            onClick={(event) => onRead(event.currentTarget)}
          >
            How I built it <ControlIcon name="arrow" />
          </button>
          <button type="button" ref={inspector} onClick={() => setShowGarden(true)}>
            View full garden <ControlIcon name="fit" />
          </button>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener"
              aria-label="Open app: bloomnote"
              aria-describedby="external-link-hint"
            >
              Open app <span aria-hidden="true">↗</span>
            </a>
          )}
        </footer>
      </div>

      {showGarden && (
        <ScreenshotViewer
          image={image}
          name="bloomnote"
          caption={caption}
          returnFocus={inspector.current}
          onClose={() => setShowGarden(false)}
          onShare={
            states
              ? () => {
                  void run(() => copyText(previewLink(location.href, 'bloomnote', view)));
                }
              : undefined
          }
          shareStatus={result === 'copied' || result === 'failed' ? result : 'idle'}
          viewLink={previewLink(location.href, 'bloomnote', view)}
          navigation={
            states && states.length > 1
              ? {
                  index: view,
                  count: states.length,
                  label: states[view]!.label,
                  onSelect: setView,
                }
              : undefined
          }
        />
      )}
    </article>
  );
}
