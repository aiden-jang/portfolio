import { clearStudioCut } from '../garageStudio/studioCut';
import { useMatchedSwap } from '../garageStudio/matchedSwap';
import { useGarageStudy } from '../garageStudy/state';
import { isMechanical, selectMechanical } from './mechanical';
import { resetStudyCamera } from '../garageStudy/state';
import { activeOrbit, repaintStudio, selectPose, useGarageStudio } from '../garageStudio/state';
import { parseScenePaint } from '../paint';
import { useAppStore } from '../store';
import { exhibitNames, resetExhibit, useGarageExhibit, type Exhibit } from './state';

export function selectExhibit(exhibit: Exhibit) {
  clearStudioCut();
  useMatchedSwap.setState({ swap: null });
  useGarageStudy.setState({ look: null });
  const garage = useGarageStudio.getState();
  if (exhibit === 'free') {
    garage.close();
    garage.open();
    repaintStudio();
    return;
  }

  if (isMechanical(exhibit)) {
    selectMechanical(exhibit);
    return;
  }

  const pair = exhibit === 'porsche';
  const lighting = exhibit === 'dusk';
  garage.select(pair ? 'lineup' : lighting ? 'light' : 'walk');
  if (!pair) garage.selectCar(lighting ? 0 : exhibit === 'cockpit' ? 10 : 20);

  resetStudyCamera();
  resetExhibit();
  useGarageExhibit.setState({ exhibit });
  useGarageStudio.setState({ proposed: !pair && !lighting });
  activeOrbit().zoom = 1;
  selectPose(
    pair ? Math.PI / 2 : exhibit === 'cockpit' ? 2.49 : exhibit === 'brakes' ? 0.71 : 0.82,
  );
}

export function openRearLouvers() {
  selectExhibit('wings');
  useGarageExhibit.setState({ louvers: true });
  activeOrbit().zoom = 0.87;
  selectPose(3.07);
}

export function openLinkedExhibit() {
  const params = new URLSearchParams(location.search);
  const louvers = params.get('louvers') === '1';
  const exhibit = params.get('exhibit') ?? (louvers ? 'wings' : null);
  if (!exhibit || exhibit === 'free' || !Object.hasOwn(exhibitNames, exhibit)) return;

  const garage = useGarageStudio.getState();
  const position = { ...activeOrbit(garage) };
  const name = exhibit as Exhibit;
  const shot = Number(params.get('shot'));
  const requestedOverlay = params.get('silhouette');
  const overlay = requestedOverlay === '0' ? 0 : requestedOverlay === '1' ? 1 : -1;
  const aligned = name === 'porsche' && params.get('aligned') === '1';
  if (name === 'wings' && louvers && !shot) openRearLouvers();
  else if (isMechanical(name)) {
    selectMechanical(name, name !== 'lamps' && (shot === 1 || shot === 2) ? shot : 0);
    if (name === 'lamps') useAppStore.setState({ headlightsRaised: params.get('part') === 'up' });
    if (name === 'wings' && shot === 1)
      useAppStore.setState({ drsOpen: params.get('part') === 'up' });
  } else selectExhibit(name);
  if (params.has('scene')) Object.assign(activeOrbit(), position);
  const look = params.get('look');
  const focus = Number(params.get('focus') ?? -1);
  const lighting = look === 'studio' || look === 'blackout' ? look : 'dusk';
  useGarageExhibit.setState({
    after: aligned || look !== 'before',
    aligned,
    overlay: aligned ? overlay : -1,
    smoothEdges: params.get('edges') !== 'standard',
    pairWingOpen: name === 'wings' && shot === 2 && params.get('part') === 'up',
    lighting,
    focus: focus === 0 || focus === 1 ? focus : -1,
    wheelClose: params.get('wheel') === 'close',
  });
  if (exhibit === 'dusk') useGarageStudio.setState({ proposed: lighting === 'blackout' });
  if (exhibit === 'porsche')
    useGarageStudio.setState({
      proposed: aligned || (garage.chapter === 'lineup' && garage.proposed),
    });
  const paint = parseScenePaint(params.get('exhibitPaint'));
  if (exhibit === 'dusk' && paint) useAppStore.setState({ activeBodyColor: paint });
  repaintStudio();
}

export function exhibitLink(base: string) {
  const {
    exhibit,
    lighting,
    after,
    focus,
    wheelClose,
    shot,
    aligned,
    overlay,
    smoothEdges,
    pairWingOpen,
    louvers,
  } = useGarageExhibit.getState();
  if (exhibit === 'free') return base;

  const url = new URL(base);
  if (louvers) url.searchParams.set('louvers', '1');
  url.searchParams.set('exhibit', exhibit);
  url.searchParams.set('look', exhibit === 'dusk' ? lighting : after ? 'after' : 'before');
  if (exhibit === 'porsche' && focus >= 0) url.searchParams.set('focus', String(focus));
  if (exhibit === 'wear' && wheelClose) url.searchParams.set('wheel', 'close');
  if (exhibit === 'dusk')
    url.searchParams.set('exhibitPaint', useAppStore.getState().activeBodyColor);

  if (aligned && overlay !== -1) url.searchParams.set('silhouette', String(overlay));
  if (aligned) url.searchParams.set('aligned', '1');
  else url.searchParams.delete('aligned');
  if (isMechanical(exhibit)) url.searchParams.set('shot', String(shot));
  else url.searchParams.delete('shot');
  if (exhibit === 'clarity') url.searchParams.set('edges', smoothEdges ? 'smooth' : 'standard');
  else url.searchParams.delete('edges');
  if (exhibit === 'wings' && shot === 2) url.searchParams.set('part', pairWingOpen ? 'up' : 'down');

  const saved = useGarageStudio.getState().saved;
  if (saved) {
    url.searchParams.set('car', String(saved.carIndex));
    url.searchParams.set('paint', saved.activeBodyColor);
    url.searchParams.set('light', saved.themeName);
  }
  return url.toString();
}
