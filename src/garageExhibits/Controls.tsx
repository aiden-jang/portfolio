import { alignPorsches, comparePorsche, isMechanical } from './mechanical';
import { MechanicalControls } from './MechanicalControls';
import { exhibitWheel } from './geometry';
import { useAppStore } from '../store';
import { repaintStudio, selectPose, useGarageStudio } from '../garageStudio/state';
import { useGarageExhibit } from './state';
import './exhibits.css';

export function ExhibitControls({ waiting }: { waiting: boolean }) {
  const { exhibit, after, focus, wheelClose } = useGarageExhibit();
  const { aligned, overlay } = useGarageExhibit();
  const chapter = useGarageStudio((s) => s.chapter);
  const car = useAppStore((s) => s.carIndex);
  const canUse =
    (exhibit === 'porsche' && chapter === 'lineup') ||
    (exhibit === 'cockpit' && chapter === 'walk' && car === 10) ||
    ((exhibit === 'brakes' || exhibit === 'wear') && chapter === 'walk' && car === 20);
  function setAfter(value: boolean) {
    useGarageExhibit.setState({ after: value, focus: -1, aligned: false, overlay: -1 });
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
      {canUse && (
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
      {canUse && exhibit === 'porsche' && aligned && (
        <div className="garage-exhibit-set" role="group" aria-label="Matched Porsche silhouettes">
          {(['Both cars', '930 Turbo', '911 RWB'] as const).map((name, index) => (
            <button
              type="button"
              key={name}
              disabled={waiting}
              aria-pressed={overlay === index - 1}
              onClick={() => comparePorsche(index === 0 ? -1 : index === 1 ? 0 : 1)}
            >
              {name}
            </button>
          ))}
        </div>
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
