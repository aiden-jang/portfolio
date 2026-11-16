import type { PreviewState } from '../data/projectPreviews';
import { usePreviewSelection } from './usePreviewSelection';

export function ProjectPreviewControls({ name, states }: { name: string; states: PreviewState[] }) {
  const [selected, select] = usePreviewSelection(name, states.length);
  return (
    <div className="preview-states" role="group" aria-label={`${name} product views`}>
      {states.map((state, index) => (
        <button
          key={state.label}
          type="button"
          aria-pressed={selected === index}
          onClick={() => select(index)}
        >
          {state.label}
        </button>
      ))}
    </div>
  );
}
