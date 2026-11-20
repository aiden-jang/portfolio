import type { MouseEventHandler } from 'react';
import { ExhibitGallery } from '../garageExhibits/ExhibitGallery';
import { openRearLouvers } from '../garageExhibits/select';
import { showSignature } from '../garageStudy/signature';

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
      {hasSignature && (
        <button
          className="studio-signature-action"
          type="button"
          disabled={waiting}
          onClick={() => (car === 0 ? openRearLouvers() : showSignature(car))}
        >
          {car === 0 ? 'Rear louvers' : 'Signature view'}
        </button>
      )}
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
        {expanded ? 'Close controls' : 'Controls'}
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
  return (
    <div className="garage-studio-row studio-tools" aria-label="Garage tools" role="group">
      <button className="studio-choose-full" disabled={!canChoose} onClick={onChoose}>
        Choose car
      </button>
      <button disabled={waiting} onClick={onPhoto}>
        Photo
      </button>
      <button disabled={waiting} onClick={onShare}>
        Share shot
      </button>
      <button disabled={waiting || pair} onClick={onStudy}>
        Render study
      </button>
    </div>
  );
}
