import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type Ref } from 'react';
import { BloomPlot } from './BloomPlot';
import { bloomExamples, bloomPhrases, localBloomNotes } from './bloomNotes';
import './bloom-draft.css';

const lenses = ['What I noticed', 'How it felt', 'What I’d keep'];

export function BloomComposer({
  titleRef,
  hidden,
  onBack,
}: {
  titleRef: Ref<HTMLHeadingElement>;
  hidden: boolean;
  onBack: () => void;
}) {
  const [sentence, setSentence] = useState(bloomExamples[0]!.sentence);
  const [bouquet, setBouquet] = useState<{ text: string; version: number }>();
  const [following, setFollowing] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [selected, select] = useState(1);
  const lines = bouquet && localBloomNotes(bouquet.text);
  const currentFlower = beat < 0 ? selected : beat;
  const input = useRef<HTMLTextAreaElement>(null);
  const plot = useRef<HTMLElement>(null);
  const revealOnPhone = useRef(false);

  useLayoutEffect(() => {
    if (!bouquet || !revealOnPhone.current) return;
    revealOnPhone.current = false;
    plot.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [bouquet]);

  useEffect(() => {
    if (!bouquet || hidden || !following) return;
    const timers = [1, 2, -1].map((next, index) =>
      window.setTimeout(() => {
        if (next === -1) select(2);
        setBeat(next);
      }, [430, 860, 1540][index]),
    );
    return () => timers.forEach(clearTimeout);
  }, [bouquet, hidden, following]);

  function plant(text: string) {
    revealOnPhone.current = matchMedia('(max-width: 767px)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setFollowing(!reduce);
    setBeat(reduce ? -1 : 0);
    select(0);
    setBouquet((previous) => ({ text, version: (previous?.version ?? 0) + 1 }));
  }

  function grow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = sentence.trim();
    if (!text) {
      input.current?.setCustomValidity('Write a sentence first.');
      input.current?.reportValidity();
      return;
    }
    plant(text);
  }

  function updateSentence(text: string) {
    input.current?.setCustomValidity('');
    setSentence(text);
  }

  return (
    <div className="bloom-draft bloom-draft-inner" hidden={hidden}>
      <header className="bloom-draft-header">
        <h3 id="bloom-draft-title" ref={titleRef} tabIndex={-1}>
          Write a bloomnote
        </h3>
        <button type="button" className="bloom-back" onClick={onBack}>
          Back to the received garden
        </button>
      </header>
      <div className="bloom-draft-grid">
        <form className="bloom-draft-form" onSubmit={grow}>
          <label htmlFor="bloom-sentence">One sentence for someone</label>
          <textarea
            ref={input}
            id="bloom-sentence"
            rows={3}
            maxLength={240}
            required
            aria-describedby="bloom-draft-help"
            value={sentence}
            onChange={(event) => updateSentence(event.currentTarget.value)}
          />
          <div className="bloom-example-list" role="group" aria-label="Example sentences">
            {bloomExamples.map(({ label, sentence }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  updateSentence(sentence);
                  plant(sentence);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="bloom-draft-footer">
            <button type="submit" className="bloom-submit">
              Grow three flowers
            </button>
            <p id="bloom-draft-help">This demo uses local examples. Your note stays in this tab.</p>
          </div>
        </form>
        <section className="bloom-draft-result" ref={plot} aria-label="Your three-flower garden">
          {bouquet && (
            <p className="bloom-source" key={bouquet.version}>
              {(() => {
                let end = 0;
                const chunks = bloomPhrases(bouquet.text).map((phrase, index) => {
                  if (!phrase) return null;
                  const start = bouquet.text.indexOf(phrase, end);
                  const prefix = bouquet.text.slice(end, start);
                  end = start + phrase.length;
                  return (
                    <span key={index}>
                      {prefix}
                      <mark data-flower={index} data-active={index === currentFlower}>
                        {phrase}
                      </mark>
                    </span>
                  );
                });
                return (
                  <>
                    {chunks}
                    {bouquet.text.slice(end)}
                  </>
                );
              })()}
            </p>
          )}
          <BloomPlot
            key={bouquet?.version}
            label="Choose a flower"
            selected={lines ? currentFlower : null}
            onSelect={(index) => {
              setFollowing(false);
              setBeat(-1);
              select(index);
            }}
            grown={Boolean(lines)}
          />
          <div
            className="bloom-draft-note"
            aria-live={beat < 0 ? 'polite' : 'off'}
            aria-atomic="true"
          >
            {lines && <p>{lenses[currentFlower]}</p>}
            <blockquote>
              {lines?.[currentFlower] ?? 'Grow your note to read what each flower holds.'}
            </blockquote>
          </div>
          {lines && (
            <button
              type="button"
              className="bloom-edit"
              onClick={() => {
                input.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
                input.current?.focus({ preventScroll: true });
              }}
            >
              Edit sentence
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
