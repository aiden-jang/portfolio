import type { WorkDetail } from '../ui/WorkModal';

/** Editorial entries shown in the Work section. The first row gets a "Live"
 *  badge automatically because it has a `link`. Add new entries here. */
export const WORK_ITEMS: WorkDetail[] = [
  {
    title: 'Blossom',
    context: 'Side project · 2025',
    summary: 'A side project of mine. Click to learn more and try it.',
    body: [
      'A web app I built on the side. Full-stack: data model, API, UI, all of it.',
      'Live at blossom.aidenjang.com — give it a spin.',
    ],
    stack: ['TypeScript', 'React', 'Node.js'],
    image: '/work/blossom.png',
    link: { label: 'Visit Blossom', url: 'https://blossom.aidenjang.com' },
  },
  {
    title: 'Monolith → Django REST + React rewrite',
    context: 'Zeta Global · 2024–present',
    summary: 'Migrated the platform off a legacy monolith. Django REST + React rewrite.',
    body: [
      'Co-led a platform-wide migration from a legacy PHP monolith to a Django REST API. The new system powers self-service native ad onboarding across 2,500+ publisher newsletters reaching ~240M readers.',
      'Owned both ends: data modeling and Django serializers on the backend, React + TypeScript components and hooks on the frontend. Shipped continuously alongside the existing system, with feature flags routing traffic to the new stack.',
    ],
    stack: ['Django', 'Python', 'REST', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    title: 'Agentic AI Playwright framework',
    context: 'Zeta Global',
    summary: 'Playwright framework where LLM agents write and self-heal E2E tests.',
    body: [
      'Three-stage pipeline — Planner, Generator, Healer. The Planner reads a feature spec and decomposes it into test scenarios. The Generator turns each scenario into a runnable Playwright spec. The Healer watches for flakes and rewrites selectors / waits when DOM changes shift the page out from under existing tests.',
      'Established baseline frontend E2E coverage across the platform without burning weeks on hand-rolled fixtures.',
    ],
    stack: ['Playwright', 'TypeScript', 'Claude API', 'Node.js'],
  },
  {
    title: 'Line Item Details: 120 → 1 API call',
    context: 'Zeta Global',
    summary: 'Cut a key admin page from 120 API calls per load down to one.',
    body: [
      'The page used a per-row component pattern that issued one API call per visible row — dozens of round-trips before the page even rendered. Consolidated everything into a single batched endpoint with the joined data the page actually needs.',
      'Load time went from "go get coffee" to instant. The internal ops and sales teams who used it daily said thanks in #engineering.',
    ],
    stack: ['Django', 'REST', 'React', 'TypeScript', 'PostgreSQL'],
  },
  {
    title: 'Sponsorships, Audience Extension, Blackout Periods',
    context: 'Zeta Global',
    summary: 'Three publisher-config tools at Zeta. Data models, APIs, UIs.',
    body: [
      'Sponsorships v1.0 — Creatives + Demand Controls. Publisher monetization configuration across media groups, sensitive categories, and RTB exchange settings.',
      'Audience Extension — campaign scheduling with bulk DMA / zip-code audience targeting.',
      'Blackout Periods — time-window controls that suppress specific creatives or exchanges. Owned data models, Django REST APIs, and React/TypeScript UIs for all three.',
    ],
    stack: ['Django', 'REST', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    title: 'Creative Mapping v2',
    context: 'LiveIntent · 2023–2024',
    summary: 'Owned Creative Mapping v2 across MySQL, REST, and Angular.',
    body: [
      'Creative-to-placement targeting for the ad-serving XML pipeline. Designed the MySQL schema for the new mapping model, built the REST API on the legacy backend, and delivered the Angular UI for publisher ops to configure targeting rules.',
      'Shipped alongside a stack of related work: third-party demand controls for RTB native + hybrid slots, five publisher data migrations, and resolution of a critical search-endpoint performance regression.',
    ],
    stack: ['MySQL', 'PHP', 'REST', 'Angular', 'TypeScript', 'XML'],
  },
];
