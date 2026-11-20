import { StudioLightControl } from './StudioLightControl';
import { showSignature } from './signature';
import { useGarageExhibit } from '../garageExhibits/state';
import { ExhibitGallery } from '../garageExhibits/ExhibitGallery';
import { ExhibitControls } from '../garageExhibits/Controls';
import { useAppStore } from '../store';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { repaintStudio, selectPose, useGarageStudio } from '../garageStudio/state';
import { track, useGarageStudy, type StudyCamera } from './state';
import './study.css';

export function StudioInvitation({ dragging }: { dragging: boolean }) {
  const glide = useGarageStudy((state) => state.camera === 'glide');
  return (
    <div className="studio-invitation">
      {glide ? 'Drag through the glide' : dragging ? 'Orbiting' : 'Drag to orbit'}
    </div>
  );
}

export function StudyControls({ waiting }: { waiting: boolean }) {
  const car = useAppStore((state) => state.carIndex);
  const chapter = useGarageStudio((state) => state.chapter);
  const { refined, camera, playing } = useGarageStudy();
  const pair = chapter === 'lineup';
  const reduced = prefersReducedMotion();
  const hasExhibit = useGarageExhibit((state) => state.exhibit !== 'free');
  function choose(view: StudyCamera) {
    const next = camera === view ? 'orbit' : view;
    useGarageStudy.setState({ camera: next, playing: false });
    if (next === 'profile') selectPose(Math.PI / 2);
    if (next === 'deck') selectPose(2.48);
    repaintStudio();
  }
  function glide() {
    if (camera === 'glide') {
      if (track.position === 1) track.position = 0;
      useGarageStudy.setState({ playing: !playing && !reduced });
    } else {
      track.position = 0;
      track.entry = 0;
      useGarageStudio.setState({ proposed: false });
      useGarageStudy.setState({
        camera: 'glide',
        playing: !reduced,
      });
    }
    repaintStudio();
  }
  return (
    <div
      className={hasExhibit ? 'garage-exhibit' : 'garage-study'}
      aria-label="Studio cameras and exhibits"
      role="group"
    >
      <ExhibitGallery />
      {hasExhibit ? (
        <ExhibitControls waiting={waiting} />
      ) : (
        <>
          <div className="garage-study-finish" aria-label="Compare finishes" role="group">
            {(
              [
                ['Current', false],
                ['Refined', true],
              ] as const
            ).map(([label, value]) => (
              <button
                type="button"
                key={label}
                aria-pressed={refined === value}
                onClick={() => {
                  useGarageStudy.setState({ refined: value });
                  repaintStudio();
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <StudioLightControl waiting={waiting} />
          <div className="garage-study-camera" role="group" aria-label="Studio cameras">
            {chapter === 'walk' && (
              <button type="button" disabled={waiting} onClick={() => showSignature(car)}>
                Signature view
              </button>
            )}
            {chapter === 'walk' && (
              <button
                type="button"
                disabled={waiting}
                aria-pressed={camera === 'profile'}
                onClick={() => choose('profile')}
              >
                Long lens
              </button>
            )}
            {chapter === 'walk' && car === 0 && (
              <button
                type="button"
                disabled={waiting}
                aria-pressed={camera === 'deck'}
                onClick={() => choose('deck')}
              >
                Rear deck
              </button>
            )}
            {pair && (
              <button
                type="button"
                disabled={waiting}
                aria-pressed={reduced ? camera === 'glide' : playing}
                onClick={glide}
              >
                {reduced ? 'Glide view' : playing ? 'Pause glide' : 'Play glide'}
              </button>
            )}
            {pair && camera === 'glide' && (
              <button type="button" onClick={() => choose('glide')}>
                Free orbit
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
