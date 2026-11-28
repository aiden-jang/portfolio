import { useContext, useLayoutEffect, useRef, useState } from 'react';
import type { WorkDetail } from '../../types';
import type { ProductPreview } from '../../data/projectPreviews';
import { kamchatkaExample as example } from '../../data/kamchatkaExample';
import { InteractiveGlobe } from './InteractiveGlobe';
import { ControlIcon } from '../ControlIcon';
import { OpenEvidence, type EvidenceFrame } from '../creative/evidenceNavigation';
import { nextWorkState } from '../workIndexNavigation';
import { evidenceHref } from '../creative/storyRoutes';

type Props = {
  item: WorkDetail;
  preview: ProductPreview;
};

export function EarthquakeFeature({ item, preview }: Props) {
  const openEvidence = useContext(OpenEvidence);
  const globeFrame = useRef<{ capture: () => EvidenceFrame | undefined }>(null);
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
      if (returnScroll.current === null)
        journey.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
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
    history.pushState(
      { ...nextWorkState(), quakeComparison: true },
      '',
      compareRoute + '/' + agency,
    );
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
      className="garage-project garage-project-featured quake-journey-run"
      data-report-open={comparing || undefined}
      data-report-agency={agency}
    >
      <div className="earthquake-feature" data-comparing="false" data-study-pin>
        <div className="earthquake-intro earthquake-title">
          <h3>{item.shortName}</h3>
        </div>
        <div className="earthquake-orbit-slot">
          <InteractiveGlobe
            image={preview.image}
            caption={preview.caption}
            onCompare={launchComparison}
            journey
            inspecting={comparing}
            frameRef={globeFrame}
            evidence={{ agency, setAgency, openEvidence }}
          />
        </div>
        {comparing ? (
          <div className="earthquake-intro earthquake-detail linked-quake-report">
            <h4 tabIndex={-1} ref={heading}>
              {example.place}
            </h4>
            <p>Two depth estimates, 16.3 km apart.</p>
            <div role="group" aria-label="Choose depth reading">
              {example.sources.map(({ name, depthKm }) => (
                <button
                  key={name}
                  aria-pressed={agency === name}
                  onClick={() => {
                    setAgency(name);
                    history.replaceState(history.state, '', compareRoute + '/' + name);
                  }}
                >
                  {name} <strong>{depthKm.toFixed(1)} km</strong>
                </button>
              ))}
            </div>
            <button className="featured-text-action" onClick={closeComparison}>
              ← Back to globe
            </button>
            <a
              className="featured-text-action"
              href={evidenceHref('everythingisfine', { agency })}
              onClick={(event) =>
                openEvidence?.(event, 'everythingisfine', () => globeFrame.current?.capture())
              }
            >
              Case study ↗
            </a>
          </div>
        ) : (
          <div className="earthquake-intro earthquake-detail">
            <div className="quake-journey-copy">
              <p className="creative-quake-hook">
                Same quake. <strong>Depth estimates differ by 16.3 km.</strong>
              </p>
            </div>
            <button
              ref={compareButton}
              type="button"
              className="featured-primary earthquake-compare"
              aria-label="Compare the Kamchatka reports"
              onClick={(event) => launchComparison(event.currentTarget)}
            >
              Compare reports <ControlIcon name="arrow" />
            </button>
            <a
              className="featured-text-action"
              href={evidenceHref('everythingisfine', { agency })}
              onClick={(event) =>
                openEvidence?.(event, 'everythingisfine', () => globeFrame.current?.capture())
              }
            >
              How I matched the reports <ControlIcon name="arrow" />
            </a>
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
