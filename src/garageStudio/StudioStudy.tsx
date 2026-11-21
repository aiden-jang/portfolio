import { useRef } from 'react';
import { useGarageStudy } from '../garageStudy/state';
import { RenderComparison } from '../garageExhibits/RecordedStudies';
import { repaintStudio } from './state';
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
  const comparison = useRef<HTMLDialogElement>(null);
  const refined = useGarageStudy((state) => state.refined);
  return (
    <>
      <div className="garage-studio-row" aria-label="Rendering passes" role="group">
        {(Object.keys(passes) as Study[]).map((pass) => (
          <button key={pass} aria-pressed={study === pass} onClick={() => onSelect(pass)}>
            {passes[pass]}
          </button>
        ))}
        <button onClick={() => comparison.current?.showModal()}>Compare passes</button>
        <button onClick={onDone}>Done</button>
      </div>
      <p className="studio-tool-note">{notes[study]}</p>
      <div className="garage-studio-row" role="group" aria-label="Compare finishes">
        {['Current', 'Refined'].map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={refined === !!index}
            onClick={() => {
              useGarageStudy.setState({ refined: !!index });
              repaintStudio();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <dialog
        ref={comparison}
        className="studio-gallery"
        aria-label="Compare recorded rendering passes"
      >
        <header>
          <h2>Compare passes</h2>
          <button type="button" onClick={() => comparison.current?.close()}>
            Close
          </button>
        </header>
        <RenderComparison />
      </dialog>
    </>
  );
}
