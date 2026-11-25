import { useContext, useLayoutEffect, useRef, useState } from 'react';
import type { WorkDetail } from '../../types';
import type { ProductPreview } from '../../data/projectPreviews';
import { kamchatkaExample as example } from '../../data/kamchatkaExample';
import { EarthquakeGlobeStill } from './EarthquakeEvidence';
import { DepthSection } from './DepthSection';
import { InteractiveGlobe } from './InteractiveGlobe';
import { ControlIcon } from '../ControlIcon';
import { OpenEvidence } from '../creative/evidenceNavigation';
import { evidenceHref } from '../creative/storyRoutes';
import { useScrollStudy } from '../../hooks/useScrollStudy';
import { QuakeReadings } from './quakeJourney';
import { advanceQuake, settleQuake } from './quakeProgress';

type Props = {
  item: WorkDetail;
  preview: ProductPreview;
};

export function EarthquakeFeature({ item, preview }: Props) {
  const openEvidence = useContext(OpenEvidence);
  const compareRoute = '#quake/kamchatka';
  const [comparing, setComparing] = useState(() => location.hash.startsWith(compareRoute));
  const [agency, setAgency] = useState<'USGS' | 'EMSC'>(() =>
    location.hash.endsWith('/EMSC') ? 'EMSC' : 'USGS',
  );
  const returnScroll = useRef<number | null>(null);
  const open = useRef<HTMLElement | null>(null);
  const compareButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const journey = useRef<HTMLElement>(null);
  useScrollStudy(journey, !comparing, advanceQuake, settleQuake);
  useLayoutEffect(() => {
    const sync = () => {
      setComparing(location.hash.startsWith(compareRoute));
      if (location.hash.startsWith(compareRoute))
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
      heading.current?.parentElement?.scrollIntoView({
        block: 'start',
        behavior: 'instant',
      });
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
    <article
      ref={journey}
      id="project-everythingisfine"
      className={
        'garage-project garage-project-featured' + (!comparing ? ' quake-journey-run' : '')
      }
    >
      <div className="earthquake-feature" data-comparing={comparing} data-study-pin>
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
              <a
                className="featured-text-action"
                href={evidenceHref('everythingisfine', { agency })}
                onClick={(event) => openEvidence?.(event, 'everythingisfine')}
              >
                See how I matched the reports <ControlIcon name="arrow" />
              </a>
            </section>
          </>
        ) : (
          <div className="earthquake-intro earthquake-title">
            <h3>{item.shortName}</h3>
          </div>
        )}
        <div className="earthquake-orbit-slot" hidden={comparing}>
          <InteractiveGlobe
            image={preview.image}
            caption={preview.caption}
            onCompare={launchComparison}
            journey
            evidence={{ agency, setAgency, openEvidence }}
          />
        </div>
        {!comparing && (
          <div className="earthquake-intro earthquake-detail">
            <div className="quake-journey-copy">
              <p className="creative-quake-hook">
                Same quake. <strong>Depth estimates differ by 16.3 km.</strong>
              </p>
              <QuakeReadings />
            </div>
            <button
              ref={compareButton}
              type="button"
              className="featured-primary earthquake-compare"
              onClick={(event) => launchComparison(event.currentTarget)}
            >
              Compare the Kamchatka reports <ControlIcon name="arrow" />
            </button>
          </div>
        )}
        {!comparing && (
          <div className="earthquake-footer">
            <span className="earthquake-record">
              Recorded layers · USGS · NOAA ·{' '}
              <a href="https://www.rainviewer.com/" target="_blank" rel="noopener noreferrer">
                Radar by RainViewer
              </a>
            </span>
            <div className="earthquake-links">
              <a
                className="featured-text-action"
                aria-label="Read the meanwhile. case study"
                href={evidenceHref('everythingisfine', { agency })}
                onClick={(event) => openEvidence?.(event, 'everythingisfine')}
              >
                Case study <ControlIcon name="arrow" />
              </a>
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
