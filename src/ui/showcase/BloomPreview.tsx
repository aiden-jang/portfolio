import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ScreenshotViewer } from '../ScreenshotViewer';
import type { PreviewState } from '../../data/projectPreviews';
import { usePreviewSelection } from '../usePreviewSelection';
import { previewIndex, previewLink } from '../previewLinks';
import { copyText } from '../../browserSharing';
import { useShareFeedback } from '../useShareFeedback';
import './bloom-garden.css';
import { BloomComposer } from './BloomComposer';
import { BloomPlot } from './BloomPlot';
import { bloomFlowers } from './bloomFlowers';
import { useScrollArrival } from '../../hooks/scrollArrival';
import { useTimedScene } from '../../hooks/useTimedScene';
import { useIdleDetail } from './useIdleDetail';
import { advanceGarden } from './gardenFocus';

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
  const [composing, setComposing] = useState(false);
  const [hasOpenedComposer, setHasOpenedComposer] = useState(false);
  const article = useRef<HTMLElement>(null);
  const write = useRef<HTMLButtonElement>(null);
  const plot = useRef<HTMLDivElement>(null);
  useIdleDetail(plot);
  const draw = useCallback((progress: number) => {
    if (article.current) advanceGarden(article.current, progress);
  }, []);
  const finishOnArrival = useTimedScene(plot, draw, { enabled: !composing, duration: 1650 });
  const settle = useCallback(
    (active: boolean) => {
      if (active) finishOnArrival(1, 0);
    },
    [finishOnArrival],
  );
  useScrollArrival(article, !composing, settle);
  useEffect(() => {
    const node = article.current;
    if (!node) return;
    let previous = -1;
    function position() {
      const top = node!.getBoundingClientRect().top;
      const close = Math.min(1, Math.max(0, (top / innerHeight - 0.04) / 0.52));
      if (close === previous) return;
      previous = close;
      node!.style.setProperty('--flower-close', String(close));
    }
    position();
    addEventListener('scroll', position, { passive: true });
    addEventListener('resize', position);
    return () => {
      removeEventListener('scroll', position);
      removeEventListener('resize', position);
    };
  }, []);
  const composerTitle = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (!hasOpenedComposer) return;
    article.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    (composing ? composerTitle.current : write.current)?.focus({ preventScroll: true });
  }, [composing, hasOpenedComposer]);
  const flower = bloomFlowers[selected];
  return (
    <article
      ref={article}
      id="project-bloomnote"
      className="bloom-garden bloom-garden-study"
      data-composing={composing || undefined}
      aria-labelledby={composing ? 'bloom-draft-title' : 'bloom-garden-title'}
    >
      <div className="bloom-garden-inner" data-study-pin hidden={composing}>
        <header className="bloom-garden-heading">
          <h2 id="bloom-garden-title">
            <button
              onClick={(event) => onRead(event.currentTarget)}
              aria-label="How I built it: bloomnote"
            >
              bloomnote <span aria-hidden="true">↗</span>
            </button>
          </h2>
          <p className="sr-only">{description}</p>
        </header>

        <div className="bloom-garden-scene">
          <figure className="bloom-garden-letter" aria-live="polite" aria-atomic="true">
            <figcaption>{flower.name}</figcaption>
            <blockquote key={flower.name}>“{flower.meaning}”</blockquote>
            <p>
              <button
                type="button"
                aria-label="View full garden"
                ref={inspector}
                onClick={() => setShowGarden(true)}
              >
                A garden from Maya to Sarah
              </button>
            </p>
          </figure>
          <BloomPlot
            plotRef={plot}
            label="Flowers in Sarah’s garden"
            selected={selected}
            onSelect={(index) => {
              if (article.current) article.current.dataset.manualFlower = '';
              select(index);
            }}
          />
        </div>

        <footer className="bloom-garden-actions">
          <button
            ref={write}
            type="button"
            className="bloom-write"
            onClick={() => {
              setHasOpenedComposer(true);
              setComposing(true);
            }}
          >
            Write a note
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

      {hasOpenedComposer && (
        <BloomComposer
          titleRef={composerTitle}
          hidden={!composing}
          onBack={() => setComposing(false)}
          onRead={onRead}
        />
      )}

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
