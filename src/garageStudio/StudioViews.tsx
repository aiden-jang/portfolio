import { useGarageExhibit } from '../garageExhibits/state';
import { resetStudyCamera, useGarageStudy } from '../garageStudy/state';
import { CARS } from '../config';
import { useAppStore } from '../store';
import { ControlIcon } from '../ui/ControlIcon';
import { clamp } from '../math';
import {
  activeOrbit,
  detailCars,
  repaintStudio,
  selectPose,
  useGarageStudio,
  type Chapter,
} from './state';

const choices: Record<Chapter, [string, string]> = {
  walk: ['Standard height', 'Wheel height'],
  detail: ['Full car', 'Close-up'],
  light: ['Studio', 'Blackout'],
  lineup: ['Ground view', 'Overhead'],
};
export function StudioViews({ waiting }: { waiting: boolean }) {
  const { chapter, proposed, guides, selectCar } = useGarageStudio();
  const id = useAppStore((s) => s.carIndex);
  const car = CARS[id];
  const { exhibit, after } = useGarageExhibit();
  const porsche = exhibit === 'porsche' && after;
  const cockpit = chapter === 'walk' && exhibit === 'cockpit' && after && id === 10;
  const wheel = chapter === 'walk' && exhibit === 'brakes' && id === 20;
  const pair = chapter === 'lineup';
  const drsOpen = useAppStore((s) => s.drsOpen);
  const raised = useAppStore((s) => s.headlightsRaised);
  const hasDRS = useAppStore((s) => s.hasDRS);
  const hasHeadlights = useAppStore((s) => s.hasPopupHeadlights);
  const selectPaint = useAppStore((s) => s.applyBodyColor);
  const activePaint = useAppStore((s) => s.activeBodyColor);
  const popups = id === 10;
  const partActive = popups ? raised : drsOpen;
  const partReady = popups ? hasHeadlights : hasDRS;
  function switchLook(value: boolean) {
    if (pair) resetStudyCamera();
    if (value === proposed) return;
    if (pair && !value) selectPose(window.innerWidth < 768 ? -0.58 : 0.72);
    useGarageStudio.setState({ proposed: value });
    repaintStudio();
  }

  function zoom(by: number) {
    const orbit = activeOrbit();
    orbit.zoom = clamp(
      orbit.zoom + by,
      useGarageStudy.getState().camera === 'deck' ? 0.64 : 0.8,
      1.65,
    );
    repaintStudio();
  }

  return (
    <>
      {!cockpit && !wheel && !(chapter === 'light' && exhibit === 'dusk') && (
        <div className="garage-studio-row studio-compare" aria-label="View options" role="group">
          {choices[chapter].map((name, index) => (
            <button
              key={name}
              aria-pressed={proposed === Boolean(index)}
              onClick={() => switchLook(Boolean(index))}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {chapter === 'detail' ? (
        <div
          className="garage-studio-row studio-parts"
          aria-label="Mechanical details"
          role="group"
        >
          {detailCars.map((index, key) => (
            <button
              key={index}
              aria-pressed={id === index}
              onClick={() => {
                selectCar(index);
                repaintStudio();
              }}
            >
              {['RB16B', 'F1-75', 'Miata'][key]}
            </button>
          ))}
          <button
            className="studio-strong"
            disabled={!partReady || waiting}
            aria-pressed={partActive}
            onClick={() => {
              const c = useAppStore.getState();
              (popups ? c.toggleHeadlights : c.toggleDRS)();
              repaintStudio();
            }}
          >
            <ControlIcon name={popups ? 'headlights' : 'wing'} />
            {popups
              ? raised
                ? 'Lower lights'
                : 'Raise lights'
              : drsOpen
                ? 'Close DRS'
                : 'Open DRS'}
          </button>
        </div>
      ) : pair ? (
        <div className="garage-studio-row">
          <span className="studio-scale">
            {porsche ? 'Matched wheelbases' : '4.36 m / ≈ 5.64 m'}
          </span>
          {proposed && (
            <button
              aria-pressed={guides}
              onClick={() => {
                useGarageStudio.setState({ guides: !guides });
                repaintStudio();
              }}
            >
              Axle guides
            </button>
          )}
        </div>
      ) : (
        <div className="garage-studio-row studio-angles" aria-label="Camera angles" role="group">
          {!cockpit &&
            !wheel &&
            [
              ['Front', 0.65],
              ['Side', Math.PI / 2],
              ['Rear', 2.61],
            ].map(([name, yaw]) => (
              <button
                key={name}
                disabled={waiting}
                onClick={() => {
                  resetStudyCamera();
                  selectPose(yaw as number);
                }}
              >
                {name}
              </button>
            ))}
          {chapter === 'light' && !car.fixedLivery && (
            <button onClick={() => selectPaint(activePaint === '#3f464e' ? 'original' : '#3f464e')}>
              {activePaint === '#3f464e' ? 'Original paint' : 'Graphite paint'}
            </button>
          )}
          <button aria-label="Zoom out" onClick={() => zoom(0.1)}>
            <ControlIcon name="zoomOut" />
          </button>
          <button aria-label="Zoom in" onClick={() => zoom(-0.1)}>
            <ControlIcon name="zoom" />
          </button>
        </div>
      )}
    </>
  );
}
