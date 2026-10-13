import { workId, WORK_ITEMS } from '../../data/workItems';
import { isPortfolioProject } from '../../data/workBrowsing';
import './experience.css';
import type { WorkDetail } from '../../types';
import { EYEBROW, H2, P_LI, Section, UL_BASE } from './shared';

const OUTCOMES: Record<string, { figure: string; label: string; title: string; detail: string }> = {
  'monolith-django-rest-react-rewrite': {
    figure: '6 months',
    label: 'two engineers',
    title: 'Replaced a live PHP backend',
    detail: 'PostgreSQL + Django REST, with a React interface. Serving 30,000+ newsletters.',
  },
  'agentic-ai-playwright-framework': {
    figure: 'First',
    label: 'automated coverage',
    title: 'Tests that keep up with a rewrite',
    detail: 'Playwright agents plan, generate and repair tests during the UI rewrite.',
  },
  'ad-slot-details-120-1-api-call': {
    figure: '60s → 2s',
    label: 'page load',
    title: '120 API calls became one',
    detail: 'Batched the joined data instead of fetching each line item separately.',
  },
  'sponsorships-audience-extension-blackout-periods': {
    figure: '100M+',
    label: 'weekly impressions',
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
  iodine: {
    figure: 'Open source',
    label: 'contributor',
    title: 'iodine',
    detail: 'Scoped command approvals, local embedding suggestions and reversible agent edits.',
  },
};

const ROLES = [
  { title: 'Software Engineer', company: 'Zeta Global', period: '2024–present' },
  { title: 'Software Engineer', company: 'LiveIntent', period: '2023–2024' },
  { title: 'Associate Software Engineer', company: 'LiveIntent', period: '2022–2023' },
];

type Props = {
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

export function ExperienceSection({ onOpen }: Props) {
  const priority = [
    'monolith-django-rest-react-rewrite',
    'ad-slot-details-120-1-api-call',
    'sponsorships-audience-extension-blackout-periods',
    'agentic-ai-playwright-framework',
  ];
  const highlights = WORK_ITEMS.filter((i) => !isPortfolioProject(i)).sort(
    (a, b) =>
      (priority.indexOf(workId(a)) < 0 ? priority.length : priority.indexOf(workId(a))) -
      (priority.indexOf(workId(b)) < 0 ? priority.length : priority.indexOf(workId(b))),
  );

  return (
    <Section id="sec-experience" side="left" desktopVertical="top" mobileVertical="top">
      <div className="panel pointer-events-auto w-full max-w-[650px]">
        <span className={EYEBROW}>01 / EXPERIENCE</span>
        <h2 className={H2}>Where I&apos;ve worked</h2>
        <ul className={`${UL_BASE} ${P_LI}`}>
          {ROLES.map((r) => (
            <li
              key={`${r.company}-${r.period}`}
              className="experience-role flex items-baseline justify-between gap-4"
            >
              <span>
                <span className="text-[var(--color-fg)]">{r.title}</span>
                <span className="experience-company text-[var(--color-muted)]">{r.company}</span>
              </span>
              <span className="shrink-0 font-[var(--font-mono)] text-[0.62rem] tracking-[0.08em] text-[var(--color-muted)]">
                {r.period}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 mb-0.5 font-[var(--font-mono)] text-[0.62rem] tracking-[0.24em] uppercase text-[var(--color-muted)]">
          Selected outcomes
        </p>
        <div>
          {highlights.slice(0, 4).map((item) => (
            <HighlightRow key={item.title} item={item} onOpen={(el) => onOpen(item, el)} />
          ))}
        </div>
        <details className="experience-more">
          <summary>
            More engineering work <span aria-hidden="true">+</span>
          </summary>
          {highlights.slice(4).map((item) => (
            <HighlightRow key={item.title} item={item} onOpen={(el) => onOpen(item, el)} />
          ))}
        </details>
        <button
          type="button"
          className="experience-open-source"
          onClick={(event) =>
            onOpen(WORK_ITEMS.find((item) => item.contribution)!, event.currentTarget)
          }
        >
          <span>Open source</span>
          <strong>iodine</strong>
          <span>Agent approvals, local embeddings and undo ↗</span>
        </button>
      </div>
    </Section>
  );
}

function HighlightRow({ item, onOpen }: { item: WorkDetail; onOpen: (el: HTMLElement) => void }) {
  const outcome = OUTCOMES[workId(item)];
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      className={`experience-outcome${workId(item) === 'ad-slot-details-120-1-api-call' ? ' experience-outcome-lead' : ''}`}
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
        <span>{item.summary}</span>
      )}
      <span className="experience-arrow" aria-hidden="true">
        ↗
      </span>
    </button>
  );
}
