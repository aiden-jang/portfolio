import { useRef } from 'react';
import { batchingStory } from '../creative/evidenceNavigation';
import { BatchingSpread } from './BatchingSpread';
import { workId, WORK_ITEMS } from '../../data/workItems';
import { isPortfolioProject } from '../../data/workBrowsing';
import './experience.css';
import './experience-fullscreen.css';
import type { WorkDetail } from '../../types';
import { Section } from './shared';
import { ControlIcon } from '../ControlIcon';

const OUTCOMES: Record<string, { figure: string; label: string; title: string; detail: string }> = {
  'monolith-django-rest-react-rewrite': {
    figure: '30,000+',
    label: 'newsletters served',
    title: 'Replaced a live PHP backend',
    detail:
      'Two engineers, six months. I owned the database models, API serializers, and the React components that used them.',
  },
  'agentic-ai-playwright-framework': {
    figure: 'Playwright',
    label: 'first automated coverage',
    title: 'Tests that keep up with a rewrite',
    detail: 'Playwright agents plan, generate and repair tests during the UI rewrite.',
  },
  'sponsorships-audience-extension-blackout-periods': {
    figure: '100M+',
    label: 'weekly Sponsorships impressions',
    title: 'Owned publisher controls end to end',
    detail: 'Scheduling and demand controls used by publishers including The Washington Post.',
  },
  'creative-mapping-v2': {
    figure: 'Schema → UI',
    label: 'full ownership',
    title: 'Creative Mapping v2',
    detail: 'MySQL, REST, and Angular targeting controls for publisher ops.',
  },
  'google-ad-manager-native-integration': {
    figure: 'From scratch',
    label: 'integration',
    title: 'Google Ad Manager native ads',
    detail: 'Endpoints, geo-targeting and Native support in the XML delivery pipeline.',
  },
  'publisher-account-migrations': {
    figure: '13',
    label: 'publisher migrations',
    title: 'Moved live publisher data safely',
    detail:
      'ACID-safe inventory, campaign and permission migrations, including BuzzFeed and Dotdash Meredith.',
  },
};

const ROLES = [
  {
    company: 'Zeta Global',
    roles: [{ title: 'Software Engineer', period: '2024–present' }],
  },
  {
    company: 'LiveIntent',
    roles: [
      { title: 'Software Engineer', period: '2023–2024' },
      { title: 'Associate Software Engineer', period: '2022–2023' },
    ],
  },
];

type Props = {
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

const leadId = batchingStory;
const supportingIds = [
  'monolith-django-rest-react-rewrite',
  'sponsorships-audience-extension-blackout-periods',
  'publisher-account-migrations',
];
const work = WORK_ITEMS.filter((item) => !isPortfolioProject(item));
const lead = work.find((item) => workId(item) === leadId);
const supporting = supportingIds
  .map((id) => work.find((item) => workId(item) === id))
  .filter((item) => item !== undefined);
const additional = work.filter(
  (item) => workId(item) !== leadId && !supportingIds.includes(workId(item)),
);

export function ExperienceSection({ onOpen }: Props) {
  const lane = useRef<HTMLDivElement>(null);
  return (
    <Section id="sec-experience" side="left" desktopVertical="top" mobileVertical="top">
      <div data-nosnippet className="experience-content pointer-events-auto">
        <header className="experience-opening">
          <h2>Experience</h2>
          <ExperienceRoles />
        </header>
        {lead && (
          <div className="batch-lane batch-print-lane" id="batching-study" ref={lane}>
            <article
              className="experience-lead batch-print-sheet"
              data-study-pin
              aria-labelledby="experience-lead-title"
            >
              <h3 id="experience-lead-title" className="sr-only">
                120 calls → 1
              </h3>
              <BatchingSpread lane={lane} />
            </article>
          </div>
        )}
        <div className="experience-followup">
          <h3>Selected engineering work</h3>
          <ExperienceOutcomes onOpen={onOpen} />
          <MoreEngineeringWork onOpen={onOpen} />
        </div>
      </div>
    </Section>
  );
}

export function ExperienceHistory({ onOpen }: Props) {
  return (
    <div className="experience-content">
      <h2 id="experience-history-title">Experience</h2>
      <ExperienceOutcomes onOpen={onOpen} />
      <div className="experience-grid">
        <ExperienceRoles />
        <div className="experience-proof">
          <MoreEngineeringWork onOpen={onOpen} />
        </div>
      </div>
    </div>
  );
}

function ExperienceRoles() {
  return (
    <div className="experience-history">
      <ol role="list">
        {ROLES.map(({ company, roles }) => (
          <li key={company} className="experience-employer">
            <strong>{company}</strong>
            <ol className="experience-roles" role="list">
              {roles.map(({ title, period }) => (
                <li key={period}>
                  <span>{title}</span>
                  <span className="experience-period">{period}</span>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExperienceOutcomes({ onOpen }: Props) {
  return (
    <div className="experience-proof-strip" aria-label="Selected engineering outcomes">
      {supporting.map((item) => (
        <HighlightRow key={item.title} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}

function MoreEngineeringWork({ onOpen }: Props) {
  if (!additional.length) return null;
  return (
    <details className="experience-more">
      <summary>
        More engineering work <span aria-hidden="true">+</span>
      </summary>
      {additional.map((item) => (
        <HighlightRow key={item.title} item={item} onOpen={onOpen} />
      ))}
    </details>
  );
}

function HighlightRow({ item, onOpen }: { item: WorkDetail } & Props) {
  const id = workId(item);
  const outcome = OUTCOMES[id];
  return (
    <button
      type="button"
      onClick={(event) => onOpen(item, event.currentTarget)}
      data-work-row={id}
      className={`experience-outcome${id === 'agentic-ai-playwright-framework' ? ' experience-outcome-qualitative' : ''}`}
    >
      {outcome ? (
        <>
          <span className="experience-figure">
            <strong>{outcome.figure}</strong>
            <span>{outcome.label}</span>
          </span>
          <span className="experience-story">
            <strong>{outcome.title}</strong>
            <span>{outcome.detail}</span>
          </span>
        </>
      ) : (
        <span className="experience-story">{item.summary}</span>
      )}
      <ControlIcon name="arrow" className="experience-arrow" />
    </button>
  );
}
