import { kamchatkaExample } from '../../data/kamchatkaExample';
import { PREVIEWS } from '../../data/projectPreviews';
import { StoryScreenshot } from '../StoryScreenshot';
import { DepthSection } from '../showcase/DepthSection';
import { EarthquakeGlobeStill, EarthquakeMatchSignals } from '../showcase/EarthquakeEvidence';
import { IodineContribution } from '../showcase/IodineContribution';
import './case-opening.css';

type Agency = (typeof kamchatkaExample.sources)[number]['name'];
export function IodineCaseOpening() {
  return (
    <section
      className="case-opening-evidence iodine-opening"
      aria-label="Recorded Iodine edit recovery"
    >
      <StoryScreenshot
        image={PREVIEWS.iodine.image}
        name="iodine"
        caption="Iodine’s editor and agent"
        cover="iodine"
      />
      <IodineContribution reader sourceLast />
    </section>
  );
}

export function QuakeCaseOpening({
  agency,
  onSelect,
}: {
  agency: Agency;
  onSelect: (agency: Agency) => void;
}) {
  const report = kamchatkaExample.sources.find((source) => source.name === agency);
  return (
    <>
      <section
        className="case-opening-evidence quake-opening"
        aria-label="Kamchatka depth comparison"
      >
        <figure className="quake-opening-globe">
          <EarthquakeGlobeStill />
          <figcaption>
            <strong>Off the east coast of Kamchatka</strong>
            <span>
              {kamchatkaExample.date} · {kamchatkaExample.time}
            </span>
          </figcaption>
        </figure>
        <div className="quake-opening-readings">
          <DepthSection selected={agency} onSelect={onSelect} controlsFirst />
          <p className="quake-opening-record" aria-live="polite">
            {agency} report <code>{report?.reportId}</code>
          </p>
        </div>
      </section>
      <EarthquakeMatchSignals />
      <p className="preview-inline-source">
        <a
          href={kamchatkaExample.report}
          target="_blank"
          rel="noopener"
          aria-describedby="external-link-hint"
        >
          USGS event record
        </a>
        <a
          href="https://github.com/aiden-jang/meanwhile/blob/main/src/sources/fixtures/one-quake-both-feeds.json"
          target="_blank"
          rel="noopener"
          aria-describedby="external-link-hint"
        >
          Matching fixture
        </a>
      </p>
    </>
  );
}
