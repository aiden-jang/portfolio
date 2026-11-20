import type { Lighting } from '../garageExhibits/state';
import { activeOrbit, repaintStudio, useGarageStudio } from '../garageStudio/state';
import { stopOrbitMotion } from '../garageStudio/orbitMotion';
import { stageStudioCut } from '../garageStudio/studioCut';
import { useGarageStudy } from './state';

export function StudioLightControl({ waiting }: { waiting: boolean }) {
  const look = useGarageStudy((s) => s.look);
  const blackout = useGarageStudio((s) => s.chapter === 'light' && s.proposed);
  return (
    <select
      className="studio-light-picker"
      aria-label="Studio lighting"
      disabled={waiting}
      value={look ?? (blackout ? 'blackout' : 'studio')}
      onChange={(event) => {
        const next = event.target.value as Lighting;
        stopOrbitMotion(activeOrbit());
        useGarageStudy.setState({ playing: false });
        stageStudioCut(() => {
          useGarageStudy.setState({ look: next });
          repaintStudio();
        }, false);
        repaintStudio();
      }}
    >
      <option value="studio">Studio lighting</option>
      <option value="dusk">Dusk lighting</option>
      <option value="blackout">Blackout</option>
    </select>
  );
}
