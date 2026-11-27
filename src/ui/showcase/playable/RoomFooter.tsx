import type { ReactNode } from 'react';
import { Icon } from './StudioIcon';

export function RoomFooter({
  roomLink,
  feedback,
  reading,
  backToGarden,
  returnToPad,
  toss,
  morning,
  light,
}: {
  roomLink: ReactNode;
  feedback: string;
  reading: boolean;
  backToGarden: () => void;
  returnToPad: () => void;
  toss: () => void;
  morning: boolean;
  light: () => void;
}) {
  return (
    <footer className="studio-room-foot" data-reading={reading || undefined}>
      <div className="studio-room-name">
        <h3 id="studio-room-title" tabIndex={-1}>
          Bean’s room
        </h3>
        <span>{roomLink}</span>
      </div>
      <div className="studio-room-message">
        <p id="sill-feedback" className="studio-room-feedback" role="status">
          {feedback}
        </p>
        {reading && (
          <button
            id="sill-garden-return"
            className="sill-garden-return"
            type="button"
            aria-describedby="sill-feedback"
            onClick={backToGarden}
          >
            <Icon name="back" size={15} /> Back to garden
          </button>
        )}
      </div>
      <div className="room-tools" role="group" aria-label="Room controls">
        <button type="button" onClick={returnToPad} aria-label="Return to drawing pad">
          <Icon name="back" size={17} />
          <span>Drawing pad</span>
        </button>
        <button type="button" onClick={toss}>
          <Icon name="mouse" size={18} />
          <span>Toss mouse</span>
        </button>
        <button
          type="button"
          onClick={light}
          aria-pressed={morning}
          aria-label={morning ? 'Evening light' : 'Morning light'}
        >
          <Icon name={morning ? 'moon' : 'sun'} size={18} />
          <span>{morning ? 'Evening' : 'Morning'}</span>
        </button>
      </div>
    </footer>
  );
}
