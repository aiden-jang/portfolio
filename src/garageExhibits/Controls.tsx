import { alignPorsches, isMechanical } from './mechanical';
import { MechanicalControls } from './MechanicalControls';
import { exhibitWheel } from './geometry';
import { useAppStore } from '../store';
import { repaintStudio, selectPose, useGarageStudio } from '../garageStudio/state';
import { selectExhibit } from './select';
import { exhibitNames, useGarageExhibit, type Lighting, type Exhibit } from './state';
import './exhibits.css';

export function ExhibitControls({ waiting }: { waiting: boolean }) {
  const { exhibit, after, lighting, focus, wheelClose } = useGarageExhibit();
  const aligned = useGarageExhibit((s) => s.aligned);
  const chapter = useGarageStudio((s) => s.chapter);
  const car = useAppStore((s) => s.carIndex);
  const canUse =
    (exhibit === 'porsche' && chapter === 'lineup') ||
    (exhibit === 'dusk' && chapter === 'light') ||
    (exhibit === 'cockpit' && chapter === 'walk' && car === 10) ||
    ((exhibit === 'brakes' || exhibit === 'wear') && chapter === 'walk' && car === 20);
  function setAfter(value: boolean) {
    useGarageExhibit.setState({ after: value, focus: -1, aligned: false });
    repaintStudio();
  }
  function setLight(value: Lighting) {
    useGarageExhibit.setState({ lighting: value });
    useGarageStudio.setState({ proposed: value === 'blackout' });
    repaintStudio();
  }
  const choices =
    exhibit === 'porsche'
      ? ['Current Lineup', '930 Turbo + RWB']
      : exhibit === 'cockpit'
        ? ['Exterior', 'Cockpit']
        : exhibit === 'brakes'
          ? ['Straight', 'Turned']
          : ['Clean', 'Race wear'];
  if (isMechanical(exhibit)) return <MechanicalControls waiting={waiting} />;
  return (
    <>
      {canUse && exhibit === 'dusk' && (
        <div className="garage-exhibit-set" role="group" aria-label="Lighting comparison">
          {(['studio', 'dusk', 'blackout'] as const).map((id) => (
            <button
              key={id}
              type="button"
              disabled={waiting}
              aria-pressed={lighting === id}
              onClick={() => setLight(id)}
            >
              {id[0].toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
      )}
      {canUse && exhibit !== 'dusk' && (
        <div className="garage-exhibit-set" role="group" aria-label="Exhibit options">
          {choices.map((label, index) => (
            <button
              key={label}
              type="button"
              disabled={waiting}
              aria-pressed={after === !!index}
              onClick={() => setAfter(!!index)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {canUse && exhibit === 'porsche' && after && (
        <button disabled={waiting} aria-pressed={aligned} onClick={() => alignPorsches(!aligned)}>
          Align front axles
        </button>
      )}
      {canUse && exhibit === 'porsche' && after && !aligned && (
        <div className="garage-exhibit-set" role="group" aria-label="Focus at the same angle">
          {['Both', '930 Turbo', '911 RWB'].map((label, index) => (
            <button
              type="button"
              key={label}
              disabled={waiting}
              aria-pressed={focus === index - 1}
              onClick={() => {
                useGarageExhibit.setState({ focus: index - 1 });
                repaintStudio();
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {canUse && exhibit === 'wear' && (
        <button
          type="button"
          disabled={waiting}
          aria-pressed={wheelClose}
          onClick={() => {
            useGarageExhibit.setState({ wheelClose: !wheelClose });
            if (!wheelClose) selectPose(0.78);
            repaintStudio();
          }}
        >
          Wheel close-up
        </button>
      )}
      {canUse && exhibit === 'brakes' && !waiting && (
        <button
          type="button"
          className="garage-exhibit-wheel"
          ref={(element) => {
            exhibitWheel.marker = element;
          }}
          onClick={() => setAfter(!after)}
          aria-label={after ? 'Straighten front wheel' : 'Turn front wheel'}
        >
          {after ? 'Straighten wheel' : 'Turn wheel'}
        </button>
      )}
    </>
  );
}

export function ExhibitPicker() {
  const exhibit = useGarageExhibit((state) => state.exhibit);
  return (
    <select
      className="studio-exhibit-picker"
      value={exhibit}
      onChange={(event) => selectExhibit(event.target.value as Exhibit)}
      aria-label="Studio exhibits"
    >
      {Object.entries(exhibitNames).map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
}
