import { useRef } from 'react';
import { useGarageStudy } from '../garageStudy/state';
import { repaintStudio, selectPose, useGarageStudio } from './state';
import type { MouseEventHandler } from 'react';
import { useGarageExhibit } from '../garageExhibits/state';
import { ExhibitGallery } from '../garageExhibits/ExhibitGallery';
import { StudioSignature } from './StudioSignature';

type Props = {
  car: number;
  hasSignature: boolean;
  waiting: boolean;
  canChoose: boolean;
  expanded: boolean;
  onChoose: MouseEventHandler<HTMLButtonElement>;
  onToggle: () => void;
};

export function StudioCompactDock({
  car,
  hasSignature,
  waiting,
  canChoose,
  expanded,
  onChoose,
  onToggle,
}: Props) {
  return (
    <div className="studio-compact-dock">
      <StudioSignature car={car} available={hasSignature} waiting={waiting} />
      <ExhibitGallery />
      <button type="button" disabled={!canChoose} onClick={onChoose}>
        Choose car
      </button>
      <button
        type="button"
        aria-controls="studio-full-dock"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {expanded ? 'Fewer views' : 'More views'}
      </button>
    </div>
  );
}

type ToolsProps = {
  waiting: boolean;
  pair: boolean;
  canChoose: boolean;
  onChoose: MouseEventHandler<HTMLButtonElement>;
  onPhoto: () => void;
  onShare: () => void;
  onStudy: () => void;
};

export function StudioTools({
  waiting,
  pair,
  canChoose,
  onChoose,
  onPhoto,
  onShare,
  onStudy,
}: ToolsProps) {
  const panel = useRef<HTMLDialogElement>(null);
  const chapter = useGarageStudio((state) => state.chapter);
  const camera = useGarageStudy((state) => state.camera);
  const free = useGarageExhibit((state) => state.exhibit === 'free');
  function run(action: () => void) {
    panel.current?.close();
    action();
  }
  return (
    <div className="garage-studio-row studio-tools" aria-label="Garage tools" role="group">
      <button className="studio-choose-full" disabled={!canChoose} onClick={onChoose}>
        Choose car
      </button>
      <button disabled={waiting} onClick={onPhoto}>
        Photo
      </button>
      <button type="button" aria-haspopup="dialog" onClick={() => panel.current?.showModal()}>
        Advanced <span aria-hidden="true">⌃</span>
      </button>
      <dialog ref={panel} className="studio-advanced" aria-label="Advanced">
        <header>
          <h3>Advanced</h3>
          <button type="button" aria-label="Close Advanced" onClick={() => panel.current?.close()}>
            ×
          </button>
        </header>
        {chapter === 'walk' && free && (
          <button
            disabled={waiting}
            aria-pressed={camera === 'profile'}
            onClick={() =>
              run(() => {
                const next = camera === 'profile' ? 'orbit' : 'profile';
                useGarageStudy.setState({ camera: next, playing: false });
                if (next === 'profile') selectPose(Math.PI / 2);
                repaintStudio();
              })
            }
          >
            Long lens
          </button>
        )}
        <button disabled={waiting} onClick={() => run(onShare)}>
          Share shot
        </button>
        <button disabled={waiting || pair} onClick={() => run(onStudy)}>
          Render study
        </button>
      </dialog>
    </div>
  );
}
