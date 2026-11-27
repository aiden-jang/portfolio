import { useEffect, useRef, useState } from 'react';
import { ScreenshotViewer } from '../ScreenshotViewer';
import type { PreviewState } from '../../data/projectPreviews';
import { usePreviewSelection } from '../usePreviewSelection';
import { previewIndex, previewLink } from '../previewLinks';
import { copyText } from '../../browserSharing';
import { useShareFeedback } from '../useShareFeedback';
import { Icon } from './playable/StudioIcon';
import { useFlowerGrowth } from './playable/useFlowerGrowth';
import { gardenFlowers as flowers } from './playable/gardenFlowers';
import type { useGardenVisit } from './playable/useGardenVisit';
import { FlowerNoteEditor } from './playable/FlowerNoteEditor';
import { FullGarden } from './playable/FullGarden';
import './bloom-garden.css';
import './playable/studio-garden.css';

export function BloomPreview({
  image,
  caption,
  states,
  description,
  url,
  onRead,
  garden,
}: {
  image: string;
  caption: string;
  states?: PreviewState[];
  description: string;
  url?: string;
  onRead: (trigger: HTMLElement) => void;
  garden: ReturnType<typeof useGardenVisit>;
}) {
  const { selected, choose, plants, plant: onPlant } = garden;
  const article = useRef<HTMLElement>(null);
  const edit = useRef<HTMLButtonElement>(null);
  const inspector = useRef<HTMLButtonElement>(null);
  const notes = flowers.map(
    (flower, index) => plants.find((plant) => plant.index === index)?.note ?? flower.phrase,
  );
  const personal = plants.map((plant) => plant.index);
  const [composing, setComposing] = useState(false);
  const [sharedExample, setSharedExample] = useState(false);
  const [growth, setGrowth] = useState(0);
  const [view, setView] = usePreviewSelection('bloomnote', states?.length ?? 1);
  const { result, run } = useShareFeedback(`bloomnote:${view}`);

  useEffect(() => {
    const node = article.current;
    if (!node) return;
    const visitor = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setGrowth((n) => n + 1);
          visitor.disconnect();
        }
      },
      { threshold: 0.48 },
    );
    visitor.observe(node);
    return () => visitor.disconnect();
  }, []);

  useEffect(() => {
    const linked = previewIndex(
      new URLSearchParams(location.search).get('preview'),
      'bloomnote',
      states?.length ?? 1,
    );
    if (linked === null || location.hash.startsWith('#work/')) return;
    let active = true;
    void document.fonts.ready.then(() => {
      if (active)
        article.current?.scrollIntoView({
          block: 'start',
          behavior: 'instant',
        });
    });
    return () => {
      active = false;
    };
  }, [states]);

  useFlowerGrowth(article, growth, selected, composing);

  function finishEditing() {
    setComposing(false);
    requestAnimationFrame(() => edit.current?.focus({ preventScroll: true }));
  }

  return (
    <article
      id="project-bloomnote"
      className="studio-garden"
      ref={article}
      data-selected-flower={selected}
      aria-labelledby="bloom-garden-title"
    >
      <div className="studio-garden-page">
        <header className="studio-garden-head">
          <h2 id="bloom-garden-title">
            <button
              type="button"
              aria-label="How I built it: bloomnote"
              onClick={(event) => onRead(event.currentTarget)}
            >
              bloomnote
              <Icon name="external" size={19} />
            </button>
          </h2>
          {url && (
            <a href={url} target="_blank" rel="noopener" aria-label="Open app: bloomnote">
              Open app
              <Icon name="external" size={14} />
            </a>
          )}
          <p className="sr-only">{description}</p>
        </header>
        <div className="studio-garden-body">
          <div className="studio-garden-letter">
            {composing ? (
              <FlowerNoteEditor
                initial={personal.includes(selected) ? notes[selected] : ''}
                onGrow={(note) => {
                  onPlant({ index: selected, note });
                  finishEditing();
                  setGrowth((n) => n + 1);
                }}
                onCancel={finishEditing}
              />
            ) : (
              <>
                <p className="studio-letter-from">
                  {personal.includes(selected) ? 'Your note' : 'Maya’s note for Sarah'}
                </p>
                <blockquote aria-live="polite">
                  <span className="studio-quote-text">“{notes[selected]}”</span>
                </blockquote>
                <div className="studio-note-tools">
                  <button
                    ref={edit}
                    type="button"
                    className="studio-grow"
                    onClick={() => setComposing(true)}
                  >
                    Write a note
                    <Icon name="pencil" size={15} />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="studio-flower-bed" role="group" aria-label="Flowers in the garden">
            {flowers.map((flower, index) => (
              <button
                key={flower.name}
                type="button"
                aria-label={flower.name}
                aria-pressed={selected === index}
                className={'studio-flower flower-' + index}
                onClick={() => {
                  choose(index);
                  setComposing(false);
                  setGrowth((n) => n + 1);
                }}
              >
                <span
                  className="studio-botanical"
                  dangerouslySetInnerHTML={{ __html: flower.art }}
                />
                <span className="studio-flower-name">{flower.name}</span>
              </button>
            ))}
          </div>
        </div>
        <footer className="studio-garden-foot">
          <button
            ref={inspector}
            onClick={() => {
              const linked = previewIndex(
                new URLSearchParams(location.search).get('preview'),
                'bloomnote',
                states?.length ?? 1,
              );
              if (linked !== null && !personal.length) setSharedExample(true);
              else garden.open();
            }}
            type="button"
          >
            View full garden
            <Icon name="external" size={14} />
          </button>
        </footer>
      </div>
      <i className="studio-note-pollen" aria-hidden="true" />
      {garden.showGarden && (
        <FullGarden
          selected={selected}
          choose={choose}
          notes={notes}
          personal={personal}
          returnFocus={inspector}
          onPlant={onPlant}
          onVisitSill={garden.visitSill}
          onClose={garden.close}
        />
      )}
      {sharedExample && (
        <ScreenshotViewer
          image={states?.[view]?.image ?? image}
          name="bloomnote"
          caption={states?.[view]?.caption ?? caption}
          returnFocus={inspector.current}
          onClose={() => setSharedExample(false)}
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
                  label: states[view].label,
                  onSelect: setView,
                }
              : undefined
          }
        />
      )}
    </article>
  );
}
