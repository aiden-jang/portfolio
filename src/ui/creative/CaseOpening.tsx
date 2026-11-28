import { kamchatkaExample } from '../../data/kamchatkaExample';
import { IodineDemo } from '../showcase/IodineDemo';
import { DepthSection } from '../showcase/DepthSection';
import { EarthquakeGlobeStill, EarthquakeMatchSignals } from '../showcase/EarthquakeEvidence';
import { useContext } from 'react';
import example from '../../data/iodineExample.json';
import { IodineSession } from '../showcase/iodine-session';
import { RecoveryEditor } from '../showcase/IodinePresentation';
import { UndoAgentContext } from '../showcase/UndoAgentContext';
import './case-opening.css';
import type { EvidenceFrame } from './evidenceNavigation';

export function BatchingCaseOpening() {
  return (
    <section className="batch-case-opening" aria-label="Ad Slot Details before and after">
      <dl className="batch-case-contract">
        <div>
          <dt>Before</dt>
          <dd>
            <strong>
              120 requests <span>·</span> <span>~60s</span>
            </strong>
            The browser fetched each linked line item separately.
          </dd>
        </div>
        <div>
          <dt>After</dt>
          <dd>
            <strong>
              1 request <span>·</span> <span>2s</span>
            </strong>
            The API returned the linked line items together.
          </dd>
        </div>
      </dl>
    </section>
  );
}

type Agency = (typeof kamchatkaExample.sources)[number]['name'];
export function IodineCaseOpening({ role }: { role: string }) {
  const { phase, setPhase } = useContext(IodineSession)!;
  const restored = phase === 'restored';
  return (
    <section className="iodine-case-evidence" aria-label="Recorded Iodine edit recovery">
      <RecoveryEditor
        restored={restored}
        inspectable
        onToggleEdit={() => setPhase(restored ? 'edited' : 'restored')}
      />
      <UndoAgentContext restored={restored} announce />
      <div className="iodine-case-notes">
        <p>{role}</p>
        <a href={example.source + '#L92-L107'} target="_blank" rel="noopener noreferrer">
          View Iodine’s restore code
        </a>
      </div>
      <details className="iodine-case-screenshot">
        <summary>Editor recording</summary>
        <IodineDemo />
      </details>
    </section>
  );
}

export function QuakeCaseOpening({
  agency,
  onSelect,
  frame,
}: {
  agency: Agency;
  onSelect: (agency: Agency) => void;
  frame?: EvidenceFrame;
}) {
  const report = kamchatkaExample.sources.find((source) => source.name === agency);
  return (
    <>
      <section
        className="case-opening-evidence quake-opening"
        aria-label="Kamchatka depth comparison"
        data-agency={agency}
      >
        <figure className="quake-opening-globe">
          {frame ? (
            <div className="case-carried-globe" data-evidence-frame>
              <img src={frame.image} alt={`Globe view from the portfolio. ${frame.place}`} />
            </div>
          ) : (
            <EarthquakeGlobeStill />
          )}
          <figcaption>
            <strong>Off the east coast of Kamchatka</strong>
            <span>
              {kamchatkaExample.date} · {kamchatkaExample.time}
            </span>
          </figcaption>
        </figure>
        <div className="quake-opening-readings">
          <div className="quake-case-chosen">
            <span>{agency} reading</span>
            <strong>
              {report?.depthKm.toFixed(1)} <small>km</small>
            </strong>
          </div>
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
