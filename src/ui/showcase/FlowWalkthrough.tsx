import { useEffect, useRef, useState } from 'react';
const steps = [
  {
    title: 'Draw',
    detail: 'A stroke starts on the player’s canvas.',
    code: 'stroke → room socket',
  },
  {
    title: 'Share',
    detail:
      'The room’s Durable Object owns the stroke log and broadcasts the update to the other players.',
    code: 'room → connected players',
  },
  {
    title: 'Guess',
    detail: 'The AI Worker rasterizes the strokes and asks a vision provider for a guess.',
    code: 'drawing → AI Worker',
  },
];
export function FlowWalkthrough() {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => timers.current.forEach(clearTimeout);
  useEffect(() => () => clear(), []);
  const choose = (n: number) => {
    clear();
    setPlaying(false);
    setStep(n);
  };
  const play = () => {
    clear();
    setStep(0);
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
      setStep(2);
      return;
    }
    setPlaying(true);
    timers.current = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setPlaying(false), 1800),
    ];
  };
  return (
    <section className="flow-walkthrough" aria-labelledby="flow-title">
      <div className="flow-title">
        <h4 id="flow-title">Follow one stroke.</h4>
        <button type="button" onClick={play}>
          {playing ? 'Replay flow' : 'Follow the flow'}
        </button>
      </div>
      <div
        className="flow-stations"
        role="group"
        aria-label="Drawing flow"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();
            choose((step + (e.key === 'ArrowRight' ? 1 : 2)) % 3);
          }
        }}
      >
        {steps.map((s, i) => (
          <button key={s.title} type="button" aria-pressed={step === i} onClick={() => choose(i)}>
            <span className="flow-dot" aria-hidden="true" />
            {s.title}
          </button>
        ))}
      </div>
      <div className="flow-explanation" aria-live="polite">
        <code>{steps[step].code}</code>
        <p>{steps[step].detail}</p>
      </div>
      <p className="flow-note">Illustrated message flow from iguess’s architecture.</p>
    </section>
  );
}
