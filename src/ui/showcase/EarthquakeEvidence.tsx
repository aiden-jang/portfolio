import { kamchatkaExample as example } from '../../data/kamchatkaExample';
import { ScreenshotImage } from '../ScreenshotImage';

export function EarthquakeGlobeStill({ onUnavailable }: { onUnavailable?: () => void }) {
  return (
    <ScreenshotImage
      src="/projects/kamchatka-globe.jpg"
      alt="Globe centered on the North Pacific, with the Kamchatka earthquake marked"
      lazy
      onUnavailable={onUnavailable}
    />
  );
}

export function EarthquakeReadings({ merge = false }: { merge?: boolean }) {
  return (
    <div className={merge ? 'earthquake-merge' : undefined}>
      <dl className="earthquake-readings">
        {example.sources.map(({ name, magnitude, depthKm, scale }) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>
              <strong>
                M{magnitude.toFixed(1)} <small>{scale}</small>
              </strong>
              <span>{depthKm.toFixed(1)} km deep</span>
            </dd>
          </div>
        ))}
      </dl>
      {merge && (
        <>
          <span className="reading-connector" aria-hidden="true" />
          <div className="earthquake-merged">
            <strong>One event on the globe</strong>
            <span>Both source readings stay attached.</span>
          </div>
        </>
      )}
    </div>
  );
}

export function EarthquakeMatch() {
  return (
    <figure className="featured-story-evidence">
      <div className="featured-story-evidence-heading">
        <strong>Kamchatka, {example.date}</strong>
        <span>Recorded example</span>
      </div>
      <EarthquakeReadings merge />
      <figcaption>
        The reports were {example.difference.seconds.toFixed(2)} seconds and{' '}
        {example.difference.kilometres} km apart. Time, location, and magnitude help match likely
        duplicates.{' '}
        <a
          href={example.report}
          target="_blank"
          rel="noopener"
          aria-describedby="external-link-hint"
        >
          USGS report <span aria-hidden="true">↗</span>
        </a>
      </figcaption>
    </figure>
  );
}
