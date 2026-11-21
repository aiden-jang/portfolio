import { kamchatkaExample } from '../../data/kamchatkaExample';
import { useState, type CSSProperties } from 'react';
import './depth-section.css';

type Agency = (typeof kamchatkaExample.sources)[number]['name'];
const [usgs, emsc] = kamchatkaExample.sources;
const range = 80;
const gap = (emsc.depthKm - usgs.depthKm).toFixed(1);

export function DepthSection({
  selected,
  onSelect,
}: {
  selected?: Agency;
  onSelect?: (agency: Agency) => void;
} = {}) {
  const [local, setLocal] = useState<Agency>('USGS');
  const active = selected ?? local;
  return (
    <figure className="earth-depth creative-depth">
      <figcaption>
        <strong>Depth below the surface</strong>
        <span>M5.8 from both agencies</span>
      </figcaption>
      <div
        className="creative-depth-scale"
        style={
          {
            '--usgs-depth': (usgs.depthKm / range) * 100 + '%',
            '--gap-depth': ((emsc.depthKm - usgs.depthKm) / range) * 100 + '%',
          } as CSSProperties
        }
      >
        <div className="creative-depth-ticks" aria-hidden="true">
          {[0, 20, 40, 60, 80].map((label) => (
            <span key={label}>
              {label}
              {label === 0 && ' km'}
            </span>
          ))}
        </div>
        <div className="creative-depth-levels" aria-hidden="true">
          {kamchatkaExample.sources.map(({ name, depthKm }) => (
            <div
              key={name}
              data-agency={name}
              data-active={name === active}
              style={{ top: (depthKm / range) * 100 + '%' }}
            >
              <span>{depthKm.toFixed(1)} km</span>
            </div>
          ))}
          <div className="creative-depth-gap">
            <span>{gap} km</span>
          </div>
        </div>
      </div>
      <div className="creative-depth-actions" role="group" aria-label="Highlight a reported depth">
        {kamchatkaExample.sources.map(({ name, depthKm }) => (
          <button
            key={name}
            type="button"
            aria-pressed={name === active}
            data-agency={name}
            onClick={() => {
              setLocal(name);
              onSelect?.(name);
            }}
          >
            <span>{name}</span>
            <strong>{depthKm.toFixed(1)} km</strong>
          </button>
        ))}
      </div>
    </figure>
  );
}
