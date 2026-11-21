import { useLayoutEffect, useRef, useState } from 'react';
import type { WorkDetail } from '../../types';
import type { ProductPreview } from '../../data/projectPreviews';
import { kamchatkaExample as example } from '../../data/kamchatkaExample';
import { EarthquakeGlobeStill } from './EarthquakeEvidence';
import { DepthSection } from './DepthSection';
import { InteractiveGlobe } from './InteractiveGlobe';
import { ControlIcon } from '../ControlIcon';
import { storyHref } from '../creative/storyRoutes';

// The visible date also applies to the snapshot poster before WebGL loads.
const snapshotDate = '2026-11-17T00:55:59.000Z';

type Props = {
  item: WorkDetail;
  preview: ProductPreview;
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

export function EarthquakeFeature({ item, preview, onOpen }: Props) {
  const compareRoute = '#quake/kamchatka';
  const [comparing, setComparing] = useState(() => location.hash.startsWith(compareRoute));
  const [agency, setAgency] = useState<'USGS' | 'EMSC'>(() =>
    location.hash.endsWith('/EMSC') ? 'EMSC' : 'USGS',
  );
  const returnScroll = useRef<number | null>(null);
  const open = useRef<HTMLElement | null>(null);
  const compareButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const sync = () => {
      setComparing(location.hash.startsWith(compareRoute));
      setAgency(location.hash.endsWith('/EMSC') ? 'EMSC' : 'USGS');
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);
  useLayoutEffect(() => {
    if (comparing) {
      heading.current?.parentElement?.scrollIntoView({ block: 'start', behavior: 'instant' });
      heading.current?.focus({ preventScroll: true });
    } else if (returnScroll.current !== null) {
      const position = returnScroll.current;
      const frame = requestAnimationFrame(() => {
        window.scrollTo({ top: position, behavior: 'instant' });
        const target = open.current?.isConnected ? open.current : compareButton.current;
        target?.focus({ preventScroll: true });
        open.current = null;
        returnScroll.current = null;
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [comparing]);
  const launchComparison = (trigger: HTMLElement) => {
    returnScroll.current = window.scrollY;
    open.current = trigger;
    history.pushState({ quakeComparison: true }, '', compareRoute + '/' + agency);
    setComparing(true);
  };
  const closeComparison = () => {
    if (history.state?.quakeComparison) history.back();
    else {
      history.replaceState(null, '', '#project-everythingisfine');
      setComparing(false);
    }
  };
  return (
    <article id="project-everythingisfine" className="garage-project garage-project-featured">
      <div className="earthquake-feature" data-comparing={comparing}>
        {comparing ? (
          <>
            <div className="earthquake-heading">
              <button type="button" className="earthquake-back" onClick={closeComparison}>
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
              <DepthSection
                selected={agency}
                onSelect={(choice) => {
                  setAgency(choice);
                  history.replaceState(history.state, '', compareRoute + '/' + choice);
                }}
              />
              <p className="earthquake-interpretation">
                Both agencies agreed on magnitude. Their depth estimates differed by about 16 km.
              </p>
              <a className="featured-text-action" href={storyHref('everythingisfine', { agency })}>
                See how I matched the reports <ControlIcon name="arrow" />
              </a>
            </section>
          </>
        ) : (
          <div className="earthquake-intro">
            <h3>{item.shortName}</h3>
            <p className="creative-quake-hook">
              Same quake, <strong>16.3 km apart.</strong>
            </p>
            <p className="creative-quake-role">I built the matching that keeps both reports.</p>
            <button
              ref={compareButton}
              type="button"
              className="featured-primary"
              onClick={(event) => launchComparison(event.currentTarget)}
            >
              Compare the Kamchatka reports <ControlIcon name="arrow" />
            </button>
          </div>
        )}
        <div className="earthquake-orbit-slot" hidden={comparing}>
          <InteractiveGlobe
            image={preview.image}
            caption={preview.caption}
            onCompare={launchComparison}
          />
        </div>
        {!comparing && (
          <div className="earthquake-footer">
            <span className="earthquake-record">
              USGS snapshot · <time dateTime={snapshotDate}>Nov 17, 2026</time> · NOAA aurora
            </span>
            <div className="earthquake-links">
              <button
                type="button"
                className="featured-text-action"
                aria-label="How I built it: meanwhile."
                onClick={(event) => onOpen(item, event.currentTarget)}
              >
                How I built it <ControlIcon name="arrow" />
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
        )}
      </div>
    </article>
  );
}
