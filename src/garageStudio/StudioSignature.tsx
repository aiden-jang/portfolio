import { openRearLouvers, selectExhibit } from '../garageExhibits/select';
import { selectMechanical } from '../garageExhibits/mechanical';
import { startBumperGlide } from '../garageStudy/glide';
import { showSignature } from '../garageStudy/signature';
import {
  clearSignatureBookmark,
  restoreStudioSnapshot,
  takeStudioSnapshot,
  useSignatureBookmark,
} from './studioTour';

const curated = {
  0: { title: 'Rear louvers', run: openRearLouvers },
  1: { title: 'Bumper glide', run: startBumperGlide },
  10: { title: 'Pop-up headlights', run: () => selectExhibit('lamps') },
  15: { title: 'DRS flap', run: () => selectMechanical('wings', 1) },
  20: { title: 'Brake reveal', run: () => selectExhibit('brakes') },
} as Partial<Record<number, { title: string; run: () => void }>>;

export function StudioSignature({
  car,
  available,
  waiting,
}: {
  car: number;
  available: boolean;
  waiting: boolean;
}) {
  const snapshot = useSignatureBookmark((s) => s.snapshot);
  const current = curated[car];
  const name = snapshot ? 'Previous view' : (current?.title ?? 'Signature view');
  if (!available && !snapshot) return null;
  return (
    <button
      className="studio-signature-action"
      type="button"
      disabled={waiting}
      onClick={(event) => {
        if (snapshot) {
          restoreStudioSnapshot(snapshot);
          clearSignatureBookmark();
        } else {
          useSignatureBookmark.setState({ snapshot: takeStudioSnapshot() });
          if (current) current.run();
          else showSignature(car);
          event.currentTarget.focus({ preventScroll: true });
        }
      }}
    >
      {name}
    </button>
  );
}
