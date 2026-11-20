import { downloadPhoto } from '../ui/photo/postcard';
import { repaintStudio, useGarageStudio, type PhotoShape } from './state';

export function StudioPhotoControls({
  photo,
  busy,
  waiting,
  file,
  onRetake,
  onCapture,
  onDone,
}: {
  photo: PhotoShape;
  busy: boolean;
  waiting: boolean;
  file?: File;
  onRetake: () => void;
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
            onRetake();
            repaintStudio();
          }}
        >
          {shape === 'portrait' ? 'Portrait 4:5' : 'Landscape 16:9'}
        </button>
      ))}
      <button
        className="studio-strong"
        disabled={busy || waiting}
        onClick={() => (file ? downloadPhoto(file) : void onCapture())}
      >
        {file ? 'Save photo' : busy ? 'Capturing…' : 'Capture'}
      </button>
      {file && <button onClick={onRetake}>Retake</button>}
      <button onClick={onDone}>Done</button>
    </div>
  );
}
