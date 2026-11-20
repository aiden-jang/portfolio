import type { Study } from './state';

const passes: Record<Study, string> = {
  finished: 'Finished',
  clay: 'Clay',
  shadows: 'Shadows',
  reflection: 'Reflection',
};
const notes: Record<Study, string> = {
  finished: 'The live Studio from your current camera.',
  clay: 'The same geometry under a matte surface.',
  shadows: 'Contact under the chassis and each tire.',
  reflection: 'The floor’s reflected view from a mirrored camera.',
};

export function StudioStudy({
  study,
  onSelect,
  onDone,
}: {
  study: Study;
  onSelect: (pass: Study) => void;
  onDone: () => void;
}) {
  return (
    <>
      <div className="garage-studio-row" aria-label="Rendering passes" role="group">
        {(Object.keys(passes) as Study[]).map((pass) => (
          <button key={pass} aria-pressed={study === pass} onClick={() => onSelect(pass)}>
            {passes[pass]}
          </button>
        ))}
        <button onClick={onDone}>Done</button>
      </div>
      <p className="studio-tool-note">{notes[study]}</p>
    </>
  );
}
