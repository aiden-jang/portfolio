import { useRef } from 'react';
import { activeOrbit, repaintStudio } from '../garageStudio/state';
import { replayOrbit } from '../garageStudio/orbitMotion';
import { useAppStore } from '../store';
import { openRearLouvers } from './select';
import { clarityViews, isMechanical, selectMechanical, wingViews } from './mechanical';
import { useGarageExhibit } from './state';
import './mechanical.css';

export function MechanicalControls({ waiting }: { waiting: boolean }) {
  const { exhibit, shot, smoothEdges, pairWingOpen, louvers } = useGarageExhibit();
  const lightsRaised = useAppStore((s) => s.headlightsRaised);
  const soloWingOpen = useAppStore((s) => s.drsOpen);
  const available = useAppStore((s) => (exhibit === 'lamps' ? s.hasPopupHeadlights : s.hasDRS));
  const comparison = useRef<HTMLDialogElement>(null);
  if (!isMechanical(exhibit)) return null;
  const paired = exhibit === 'wings' && shot === 2;
  const wingOpen = paired ? pairWingOpen : soloWingOpen;
  const views = exhibit === 'wings' ? wingViews : exhibit === 'clarity' ? clarityViews : [];
  return (
    <div className="garage-exhibit-set mechanical-views" role="group" aria-label="Study options">
      {views.map((label, index) => (
        <button
          key={label}
          aria-pressed={index === shot && !louvers}
          onClick={() => selectMechanical(exhibit, index)}
        >
          {label}
        </button>
      ))}
      {exhibit === 'wings' && shot > 0 && (
        <button
          disabled={waiting || (!paired && !available)}
          aria-pressed={wingOpen}
          onClick={() => {
            if (paired) useGarageExhibit.setState({ pairWingOpen: !pairWingOpen });
            else useAppStore.getState().toggleDRS();
            repaintStudio();
          }}
        >
          {wingOpen ? 'Close DRS' : 'Open DRS'}
        </button>
      )}
      {exhibit === 'wings' && shot === 0 && (
        <button disabled={waiting} aria-pressed={louvers} onClick={openRearLouvers}>
          Rear louvers
        </button>
      )}
      {exhibit === 'wings' && (
        <button
          disabled={waiting}
          onClick={() => {
            replayOrbit(activeOrbit());
            repaintStudio();
          }}
        >
          Replay angle
        </button>
      )}
      {exhibit === 'clarity' && (
        <button
          disabled={waiting}
          aria-pressed={smoothEdges}
          onClick={() => {
            useGarageExhibit.setState({ smoothEdges: !smoothEdges });
            repaintStudio();
          }}
        >
          Smooth edges
        </button>
      )}
      {exhibit === 'lamps' && (
        <>
          <button
            disabled={waiting || !available}
            aria-pressed={lightsRaised}
            onClick={() => {
              useAppStore.getState().toggleHeadlights();
              repaintStudio();
            }}
          >
            {lightsRaised ? 'Lower lights' : 'Raise lights'}
          </button>
          <button onClick={() => comparison.current?.showModal()}>Compare states</button>
          <dialog
            ref={comparison}
            className="studio-lamp-comparison"
            aria-labelledby="lamp-comparison-title"
          >
            <header>
              <h3 id="lamp-comparison-title">Miata pop-up headlights</h3>
              <button onClick={() => comparison.current?.close()}>Back to orbit</button>
            </header>
            <div className="studio-lamp-labels">
              <span>Lights lowered</span>
              <span>Lights raised</span>
            </div>
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/showroom/miata-headlights-portrait.webp"
              />
              <img
                loading="lazy"
                src="/showroom/miata-headlights.webp"
                alt="The Miata from the same angle before and after the headlight housings lift and light the concrete."
              />
            </picture>
          </dialog>
        </>
      )}
    </div>
  );
}
