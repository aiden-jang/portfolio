import { useGarageExhibit } from '../garageExhibits/state';
import { applyF40HeadlightPreset, isGarageAfterHours } from '../garageStudio/lighting';
import { activeOrbit, repaintStudio, useGarageStudio } from '../garageStudio/state';
import { stopOrbitMotion } from '../garageStudio/orbitMotion';
import { clearStudioCut } from '../garageStudio/studioCut';
import { useAppStore } from '../store';
import { useGarageStudy } from './state';

export function StudioLightControl({ waiting }: { waiting: boolean }) {
  const look = useGarageStudy((state) => state.look);
  const theme = useAppStore((state) => state.themeName);
  const afterHours = useGarageStudio((state) => isGarageAfterHours(theme, state, look));
  const chapter = useGarageStudio((state) => state.chapter);
  const exhibit = useGarageExhibit((state) => state.exhibit);
  if (chapter === 'light') {
    return (
      <button
        className="studio-exhibit-exit"
        type="button"
        onClick={(event) => {
          event.currentTarget
            .closest('.studio-compact-dock, .garage-study, .garage-exhibit')
            ?.querySelector<HTMLButtonElement>('.studio-gallery-trigger')
            ?.focus({ preventScroll: true });
          useGarageStudio.getState().select('walk');
          repaintStudio();
        }}
      >
        Back to Walkaround
      </button>
    );
  }
  if (chapter !== 'walk' || exhibit !== 'free') return null;

  function select(preset: 'studio' | 'night') {
    if (
      (look === null || look === 'studio' || look === 'night') &&
      (preset === 'night') === afterHours
    )
      return;
    stopOrbitMotion(activeOrbit(), 'requested');
    clearStudioCut();
    useGarageStudy.setState({ look: preset, playing: false });
    applyF40HeadlightPreset(preset);
    repaintStudio();
  }

  return (
    <div className="studio-preset-switch" role="group" aria-label="Garage lighting">
      <button
        type="button"
        disabled={waiting}
        aria-pressed={!afterHours}
        onClick={() => select('studio')}
      >
        Studio
      </button>
      <button
        type="button"
        disabled={waiting}
        aria-pressed={afterHours}
        onClick={() => select('night')}
      >
        After Hours
      </button>
    </div>
  );
}
