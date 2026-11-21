import { WedgeStudy } from './RecordedStudies';
import { useId, useRef, useState } from 'react';
import { openRearLouvers, selectExhibit } from './select';
import { exhibitNames, useGarageExhibit, type Exhibit } from './state';
import { repaintStudio } from '../garageStudio/state';
import { alignPorsches } from './mechanical';
import { useAppStore } from '../store';
import './exhibit-gallery.css';
import { startStudioTour } from '../garageStudio/studioTour';

const featured = [
  {
    name: 'F40 rear louvers',
    image: '/showroom/exhibits/louvers.webp',
    description: 'Drag across the slats to see the engine underneath.',
    open: openRearLouvers,
  },
  {
    name: 'Miata pop-up headlights',
    image: '/showroom/exhibits/miata.webp',
    description: 'Raise the lamps and watch the light hit the floor.',
    open: () => {
      selectExhibit('lamps');
      useAppStore.setState({ headlightsRaised: true });
      repaintStudio();
    },
  },
  {
    name: 'Porsche Lineup',
    image: '/showroom/exhibits/porsche.webp',
    description: 'Compare the two silhouettes with their front axles aligned.',
    open: () => {
      selectExhibit('porsche');
      alignPorsches(true);
    },
  },
];

export function ExhibitGallery() {
  const titleId = useId();
  const [wedge, setWedge] = useState(false);
  const gallery = useRef<HTMLDialogElement>(null);
  const current = useGarageExhibit((s) => s.exhibit);
  const choose = (open: () => void) => {
    gallery.current?.close();
    open();
  };
  return (
    <>
      <button
        type="button"
        className="studio-gallery-trigger"
        aria-haspopup="dialog"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          setWedge(false);
          gallery.current?.showModal();
        }}
      >
        Studio exhibits
      </button>
      <dialog ref={gallery} className="studio-gallery" aria-labelledby={titleId}>
        <header>
          <h2 id={titleId}>Studio exhibits</h2>
          <button type="button" onClick={() => gallery.current?.close()}>
            Close
          </button>
        </header>
        <button
          className="creative-tour-start"
          type="button"
          onClick={() => choose(startStudioTour)}
        >
          Take the four-stop Studio tour
        </button>
        <button type="button" aria-expanded={wedge} onClick={() => setWedge(!wedge)}>
          Wedge profiles
        </button>
        {wedge && <WedgeStudy />}
        <div className="studio-gallery-shots">
          {featured.map((shot) => (
            <button key={shot.image} type="button" onClick={() => choose(shot.open)}>
              <img src={shot.image} loading="lazy" alt="" width="640" height="360" />
              <span>
                <strong>{shot.name}</strong>
                <small>{shot.description}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="studio-gallery-all" aria-label="All exhibits" role="group">
          {Object.entries(exhibitNames).map(([id, name]) => (
            <button
              key={id}
              type="button"
              aria-pressed={id === current}
              onClick={() => choose(() => selectExhibit(id as Exhibit))}
            >
              {id === 'free' ? 'Free orbit' : name}
            </button>
          ))}
        </div>
      </dialog>
    </>
  );
}
