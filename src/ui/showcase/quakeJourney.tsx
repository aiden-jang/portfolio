import { kamchatkaExample } from '../../data/kamchatkaExample';
import map from './kamchatka-map.svg';
import './quakeJourney.css';

export function QuakeMap() {
  return (
    <div className="quake-travel-art" aria-hidden="true">
      <div className="quake-map">
        <div className="quake-map-image" style={{ backgroundImage: `url(${map})` }} />
      </div>
      <span className="quake-map-pin" />
      <span className="quake-map-magnitude">M{kamchatkaExample.sources[0].magnitude}</span>
    </div>
  );
}

export function QuakeReadings() {
  return (
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
      <p>Depth below the surface</p>
    </div>
  );
}
