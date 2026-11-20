import { repaintStudio, useGarageStudio, type PhotoShape } from './state';

export function StudioPhotoControls({
  photo,
  busy,
  waiting,
  onCapture,
  onDone,
}: {
  photo: PhotoShape;
  busy: boolean;
  waiting: boolean;
  onCapture: () => Promise<void>;
  onDone: () => void;
}) {
  return (
    <div className="garage-studio-row" aria-label="Photo controls" role="group">
      {(['portrait', 'landscape'] as const).map((shape) => (
        <button
          key={shape}
          aria-pressed={photo === shape}
          disabled={busy}
          onClick={() => {
            useGarageStudio.setState({ photo: shape });
            repaintStudio();
          }}
        >
          {shape === 'portrait' ? 'Portrait 4:5' : 'Landscape 16:9'}
        </button>
      ))}
      <button className="studio-strong" disabled={busy || waiting} onClick={() => void onCapture()}>
        {busy ? 'Capturing…' : 'Capture'}
      </button>
      <button onClick={onDone}>Done</button>
    </div>
  );
}
