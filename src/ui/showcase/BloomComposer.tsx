import { useLayoutEffect, useRef, useState, type FormEvent, type Ref } from 'react';
import { BloomPlot } from './BloomPlot';
import { bloomExamples, localBloomNotes } from './bloomNotes';
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
  const [lines, setLines] = useState<string[]>();
  const [selected, select] = useState(1);
  const input = useRef<HTMLTextAreaElement>(null);
  const plot = useRef<HTMLDivElement>(null);
  const revealOnPhone = useRef(false);

  useLayoutEffect(() => {
    if (!lines || !revealOnPhone.current) return;
    revealOnPhone.current = false;
    plot.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    plot.current
      ?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
      ?.focus({ preventScroll: true });
  }, [lines]);

  function grow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = sentence.trim();
    if (!text) {
      input.current?.setCustomValidity('Write a sentence first.');
      input.current?.reportValidity();
      return;
    }
    revealOnPhone.current = matchMedia('(max-width: 767px)').matches;
    select(1);
    setLines([...localBloomNotes(text)]);
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
              <button key={label} type="button" onClick={() => updateSentence(sentence)}>
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
        <section className="bloom-draft-result" aria-label="Your three-flower garden">
          <BloomPlot
            label="Choose a flower"
            selected={lines ? selected : null}
            onSelect={select}
            grown={Boolean(lines)}
            plotRef={plot}
          />
          <div className="bloom-draft-note" aria-live="polite" aria-atomic="true">
            {lines && <p>{lenses[selected]}</p>}
            <blockquote>
              {lines?.[selected] ?? 'Grow your note to read what each flower holds.'}
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
