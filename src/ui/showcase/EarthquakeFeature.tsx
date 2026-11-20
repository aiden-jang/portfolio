import { useLayoutEffect, useRef, useState } from 'react';
import type { WorkDetail } from '../../types';
import type { ProductPreview } from '../../data/projectPreviews';
import { kamchatkaExample as example } from '../../data/kamchatkaExample';
import { EarthquakeGlobeStill } from './EarthquakeEvidence';
import { DepthSection } from './DepthSection';
import { InteractiveGlobe } from './InteractiveGlobe';

type Props = {
  item: WorkDetail;
  preview: ProductPreview;
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

export function EarthquakeFeature({ item, preview, onOpen }: Props) {
  const [comparing, setComparing] = useState(false);
  const returnScroll = useRef<number | null>(null);
  const open = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (returnScroll.current === null) return;
    if (comparing) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.parentElement?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else {
      window.scrollTo({ top: returnScroll.current, behavior: 'instant' });
      open.current?.focus({ preventScroll: true });
      returnScroll.current = null;
    }
  }, [comparing]);
  const setComparison = (enabled: boolean) => {
    if (enabled) returnScroll.current = window.scrollY;
    setComparing(enabled);
  };
  return (
    <article id="project-everythingisfine" className="garage-project garage-project-featured">
      <div className="earthquake-feature" data-comparing={comparing}>
        {comparing ? (
          <>
            <div className="earthquake-heading">
              <button
                type="button"
                className="earthquake-back"
                onClick={() => setComparison(false)}
              >
                <span aria-hidden="true">← </span>Back to the globe preview
              </button>
              <h3 ref={heading} tabIndex={-1}>
                One earthquake. <br />
                Two readings.
              </h3>
            </div>
            <figure className="earthquake-still">
              <EarthquakeGlobeStill />
              <figcaption>Kamchatka</figcaption>
            </figure>
            <section className="earthquake-inspection" aria-labelledby="recorded-earthquake">
              <h4 id="recorded-earthquake">{example.place}</h4>
              <p className="earthquake-date">
                <time dateTime={example.timestamp}>
                  {example.date} · {example.time}
                </time>
                {' · Recorded event'}
              </p>
              <DepthSection />
              <p className="earthquake-interpretation">
                Both agencies agreed on magnitude. Their depth estimates differed by about 16 km.
              </p>
              <button
                type="button"
                className="featured-text-action"
                onClick={(event) => onOpen(item, event.currentTarget)}
              >
                See how I matched the reports <span aria-hidden="true">↗</span>
              </button>
            </section>
          </>
        ) : (
          <>
            <div className="earthquake-intro">
              <h3>{item.shortName}</h3>
              <p>{preview.description ?? item.summary}</p>
              <button
                ref={open}
                type="button"
                className="featured-primary"
                onClick={() => setComparison(true)}
              >
                Compare the Kamchatka reports <span aria-hidden="true">↗</span>
              </button>
            </div>
            <InteractiveGlobe image={preview.image} caption={preview.caption} />
            <div className="earthquake-footer">
              <span className="earthquake-record">Recorded USGS events · NOAA aurora</span>
              <div className="earthquake-links">
                <button
                  type="button"
                  className="featured-text-action"
                  aria-label="How I built it: meanwhile."
                  onClick={(event) => onOpen(item, event.currentTarget)}
                >
                  How I built it <span aria-hidden="true">↗</span>
                </button>
                {item.link && (
                  <a
                    className="earthquake-app"
                    href={item.link.url}
                    target="_blank"
                    aria-describedby="external-link-hint"
                    aria-label="Open meanwhile."
                    rel="noopener"
                  >
                    Open app <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
