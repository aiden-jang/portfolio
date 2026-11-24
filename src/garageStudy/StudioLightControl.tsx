import { useGarageExhibit, type Lighting } from '../garageExhibits/state';
import { isGarageAfterHours } from '../garageStudio/lighting';
import { activeOrbit, repaintStudio, useGarageStudio } from '../garageStudio/state';
import { stopOrbitMotion } from '../garageStudio/orbitMotion';
import { stageStudioCut } from '../garageStudio/studioCut';
import { useAppStore } from '../store';
import { useGarageStudy } from './state';

export function StudioLightControl({ waiting }: { waiting: boolean }) {
  const look = useGarageStudy((s) => s.look);
  const theme = useAppStore((s) => s.themeName);
  const afterHours = useGarageStudio((s) => isGarageAfterHours(theme, s, look));
  const walkaround = useGarageStudio((s) => s.chapter === 'walk');
  const blackout = useGarageStudio((s) => s.chapter === 'light' && s.proposed);
  const exhibit = useGarageExhibit((s) => s.exhibit);
  const exhibitLook = useGarageExhibit((s) => s.lighting);
  return (
    <select
      className="studio-light-picker"
      aria-label="Studio lighting"
      disabled={waiting}
      value={
        look ??
        (exhibit === 'dusk' ? exhibitLook : blackout ? 'blackout' : afterHours ? 'night' : 'studio')
      }
      onChange={(event) => {
        const next = event.target.value;
        stopOrbitMotion(activeOrbit(), 'requested');
        useGarageStudy.setState({ playing: false });
        stageStudioCut(() => {
          if (next === 'night') {
            useGarageStudy.setState({ look: next });
          } else if (exhibit === 'dusk') {
            useGarageExhibit.setState({ lighting: next as Lighting });
            useGarageStudio.setState({ proposed: next === 'blackout' });
          } else useGarageStudy.setState({ look: next as Lighting });
          repaintStudio();
        }, false);
        repaintStudio();
      }}
    >
      <option value="studio">Studio lighting</option>
      {walkaround && exhibit === 'free' && <option value="night">After Hours</option>}
      <option value="dusk">Dusk lighting</option>
      <option value="blackout">Blackout</option>
    </select>
  );
}
