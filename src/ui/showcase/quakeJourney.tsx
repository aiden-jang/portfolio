import { kamchatkaExample } from '../../data/kamchatkaExample';
import './quakeJourney.css';

export function QuakeReadings() {
  return (
    <aside className="quake-reading-track" aria-label="Recorded Kamchatka depth readings">
      <span className="quake-reading-pin" aria-hidden="true" />
      <span className="quake-reading-line" aria-hidden="true" />
      <div className="quake-journey-readings">
        <p>Kamchatka · M{kamchatkaExample.sources[0].magnitude}</p>
        <dl>
          {kamchatkaExample.sources.map(({ name, depthKm }) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>
                {depthKm.toFixed(1)} <small>km</small>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
