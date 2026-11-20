import { kamchatkaExample } from '../../data/kamchatkaExample';
import type { CSSProperties } from 'react';
import './depth-section.css';

const scaleKm = 80;

export function DepthSection() {
  return (
    <figure className="earth-depth">
      <figcaption>
        <strong>Depth below the surface</strong>
        <span>M5.8 from both agencies</span>
      </figcaption>
      <div className="earth-depth-plot">
        <div className="earth-depth-ticks" aria-hidden="true">
          {[0, 20, 40, 60, 80].map((km) => (
            <span key={km}>{km === 0 ? '0 km' : km}</span>
          ))}
        </div>
        <dl aria-label="Reported depths">
          {kamchatkaExample.sources.map(({ name, depthKm }) => (
            <div key={name} style={{ '--depth': (depthKm / scaleKm) * 100 + '%' } as CSSProperties}>
              <dt>{name}</dt>
              <dd>{depthKm.toFixed(1)} km</dd>
            </div>
          ))}
        </dl>
      </div>
    </figure>
  );
}
