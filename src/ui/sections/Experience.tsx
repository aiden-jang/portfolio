import { RequestReplay } from '../RequestReplay';
import { storyHref } from '../creative/storyRoutes';
import { workId, WORK_ITEMS } from '../../data/workItems';
import { isPortfolioProject } from '../../data/workBrowsing';
import './experience.css';
import type { WorkDetail } from '../../types';
import { Section } from './shared';
import { ControlIcon } from '../ControlIcon';

const OUTCOMES: Record<string, { figure: string; label: string; title: string; detail: string }> = {
  'monolith-django-rest-react-rewrite': {
    figure: '30,000+',
    label: 'newsletters served',
    title: 'Replaced a live PHP backend',
    detail: 'Two engineers, six months. Django REST and PostgreSQL, with a React interface.',
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

const leadId = 'ad-slot-details-120-1-api-call';
const loadTime = { before: 60, after: 2 };
const supportingIds = [
  'monolith-django-rest-react-rewrite',
  'sponsorships-audience-extension-blackout-periods',
  'agentic-ai-playwright-framework',
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
  return (
    <Section id="sec-experience" side="left" desktopVertical="top" mobileVertical="top">
      <div data-nosnippet className="experience-content pointer-events-auto">
        <h2>Experience</h2>
        <div className="experience-grid">
          {lead && <LeadOutcome item={lead} />}
          <div className="experience-history">
            <h3>Where I&apos;ve worked</h3>
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
          <div className="experience-proof">
            <div>
              {supporting.map((item) => (
                <HighlightRow key={item.title} item={item} onOpen={onOpen} />
              ))}
            </div>
            {additional.length > 0 && (
              <details className="experience-more">
                <summary>
                  More engineering work <span aria-hidden="true">+</span>
                </summary>
                {additional.map((item) => (
                  <HighlightRow key={item.title} item={item} onOpen={onOpen} />
                ))}
              </details>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

function LeadOutcome({ item }: { item: WorkDetail }) {
  return (
    <article className="experience-lead">
      <p className="experience-measure">
        <span className="sr-only">
          Page load went from {loadTime.before} seconds to {loadTime.after} seconds.
        </span>
        <span className="experience-from" aria-hidden="true">
          {loadTime.before}s
        </span>
        <span className="experience-change" aria-hidden="true">
          →
        </span>
        <span aria-hidden="true">{loadTime.after}s</span>
      </p>
      <div className="experience-lead-story">
        <h3 id="experience-lead-title">120 API calls became one</h3>
        <p>I combined the linked line items into one API response, cutting page load time.</p>
        <div className="experience-lead-actions">
          <a
            href={storyHref('ad-slot-details-120-1-api-call')}
            className="experience-case"
            aria-describedby="experience-lead-title"
          >
            Read the case study <ControlIcon name="arrow" />
          </a>
          <span>{item.context}</span>
        </div>
        <RequestReplay />
      </div>
    </article>
  );
}

function HighlightRow({ item, onOpen }: { item: WorkDetail } & Props) {
  const id = workId(item);
  const outcome = OUTCOMES[id];
  return (
    <button
      type="button"
      onClick={(event) => onOpen(item, event.currentTarget)}
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
