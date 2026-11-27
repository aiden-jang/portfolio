import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { ScreenshotViewer } from '../ScreenshotViewer';
import type { PreviewState } from '../../data/projectPreviews';
import { usePreviewSelection } from '../usePreviewSelection';
import { previewIndex, previewLink } from '../previewLinks';
import { copyText } from '../../browserSharing';
import { useShareFeedback } from '../useShareFeedback';
import { Icon } from './playable/StudioIcon';
import { useFlowerGrowth } from './playable/useFlowerGrowth';
import anemone from '../../../studio-art/anemone.svg?raw';
import gerbera from '../../../studio-art/gerbera.svg?raw';
import ranunculus from '../../../studio-art/ranunculus.svg?raw';
import './bloom-garden.css';
import './playable/studio-garden.css';

const flowers = [
  { name: 'Anemone', phrase: 'You notice the little things.', art: anemone },
  {
    name: 'Gerbera',
    phrase: 'You made a rainy walk feel like home.',
    art: gerbera,
  },
  { name: 'Ranunculus', phrase: 'You make room for me.', art: ranunculus },
];

export function BloomPreview({
  image,
  caption,
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
  const article = useRef<HTMLElement>(null);
  const edit = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const inspector = useRef<HTMLButtonElement>(null);
  const [selected, choose] = useState(1);
  const [notes, setNotes] = useState(flowers.map((flower) => flower.phrase));
  const [personal, setPersonal] = useState<number[]>([]);
  const [composing, setComposing] = useState(false);
  const [sentence, setSentence] = useState('');
  const [showGarden, setShowGarden] = useState(false);
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

  useLayoutEffect(() => {
    if (composing) input.current?.focus({ preventScroll: true });
  }, [composing]);

  useFlowerGrowth(article, growth, selected, composing);

  function plant(event: FormEvent) {
    event.preventDefault();
    const text = sentence.trim();
    if (!text) {
      input.current?.setCustomValidity('Write a short note first.');
      input.current?.reportValidity();
      return;
    }
    setNotes((current) => current.map((note, i) => (i === selected ? text : note)));
    setPersonal((current) => (current.includes(selected) ? current : [...current, selected]));
    setComposing(false);
    setGrowth((n) => n + 1);
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
              <form onSubmit={plant} className="studio-note-form">
                <label htmlFor="studio-note">A note for someone</label>
                <textarea
                  id="studio-note"
                  ref={input}
                  rows={3}
                  maxLength={105}
                  value={sentence}
                  required
                  placeholder="You made my day when…"
                  onChange={(event) => {
                    event.currentTarget.setCustomValidity('');
                    setSentence(event.target.value);
                  }}
                />
                <div className="studio-note-tools">
                  <button type="submit" className="studio-grow">
                    Grow a flower
                    <Icon name="arrow" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComposing(false);
                      requestAnimationFrame(() => edit.current?.focus({ preventScroll: true }));
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
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
                    onClick={() => {
                      setSentence(personal.includes(selected) ? notes[selected] : '');
                      setComposing(true);
                    }}
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
          <button ref={inspector} onClick={() => setShowGarden(true)} type="button">
            View full garden
            <Icon name="external" size={14} />
          </button>
        </footer>
      </div>
      <i className="studio-note-pollen" aria-hidden="true" />
      {showGarden && (
        <ScreenshotViewer
          image={states?.[view]?.image ?? image}
          name="bloomnote"
          caption={states?.[view]?.caption ?? caption}
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
