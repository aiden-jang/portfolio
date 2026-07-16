import type { WorkDetail } from '../ui/WorkModal';

/** Editorial entries shown in the Work section. The first row gets a "Live"
 *  badge automatically because it has a `link`. Add new entries here. */
export const WORK_ITEMS: WorkDetail[] = [
  {
    title: 'A platform of shipped side projects',
    context: 'Personal platform',
    summary: 'Several apps of my own on one $0 Cloudflare stack, tied together by a shared sign-in I built.',
    body: [
      'Everything runs on Cloudflare’s free tier (Workers, D1, Durable Objects) under a hard $0-hosting budget with no cold starts. The connective tissue is a shared identity service: one sign-in that every app on *.aidenjang.com trusts.',
      'The auth Worker issues an httpOnly session cookie on the parent domain, and a published npm SDK (@aidenjang/auth-client) is the single place the session contract lives. Apps never touch the session secret; they forward the cookie to /auth/me from their own Worker. Email + password (PBKDF2), Google OIDC, and passwordless magic links, all enforced server-side.',
      'Each app below is its own repo that consumes the shared SDK as a versioned dependency, so the session contract has exactly one source of truth. Signing in is optional everywhere: it syncs your data across apps, but nothing gates on an account.',
    ],
    stack: ['Cloudflare Workers', 'Durable Objects', 'D1', 'OIDC', 'TypeScript', 'React'],
    mark: 'auth',
    shortName: 'The platform',
    tagline: 'One login, every app.',
    link: { label: 'Visit the sign-in hub', url: 'https://accounts.aidenjang.com' },
  },
  {
    title: 'iguess: realtime draw-and-guess vs an AI',
    context: 'Side project',
    summary: 'A multiplayer draw-and-guess game where an AI vision model races you to guess the drawing.',
    body: [
      'skribbl.io-style realtime rooms, but the twist is an AI that actually looks at the canvas. One Cloudflare Durable Object per room is the single authority for that room’s WebSocket and game state; a separate Worker rasterizes the live strokes and calls a vision model to guess.',
      'Three game modes (AI guesser, AI drawer, and a humans-vs-AI team battle) run on one unchanged shared engine. The abstraction that unlocked it was a transport-agnostic draw() verb, so strokes no longer have to originate from a human socket. Reconnect is handled with a client-asserted id and a full state replay on connect.',
    ],
    stack: ['Cloudflare Workers', 'Durable Objects', 'WebSockets', 'Canvas', 'Vision LLM', 'React'],
    mark: 'iguess',
    shortName: 'iguess',
    tagline: 'Pictionary vs. a robot.',
    link: { label: 'Play iguess', url: 'https://iguess.aidenjang.com' },
  },
  {
    title: 'owewell: split bills, settle up',
    context: 'Side project',
    summary: 'A live bill-splitting app that untangles who owes whom and minimizes the payments to settle up.',
    body: [
      'Groups, itemized expenses, and multiple split methods (evenly, by shares, or exact amounts), all synced live. Money is stored as integer cents end to end, so no floating-point drift ever creeps into a balance.',
      'Built on Hono + D1/Drizzle with a Durable Object for the live session, React/Vite/Tailwind on top. The settle-up step computes a minimal set of transactions to zero everyone out, and pay links deep-link into the right app with the amount prefilled.',
    ],
    stack: ['Cloudflare Workers', 'Hono', 'D1', 'Drizzle', 'Durable Objects', 'React'],
    mark: 'owewell',
    shortName: 'owewell',
    tagline: 'Who owes who, no drama.',
    link: { label: 'Open owewell', url: 'https://owewell.aidenjang.com' },
  },
  {
    title: 'wherever: group restaurant picking',
    context: 'Side project',
    summary: 'A group picks a place to eat by swiping; majority vote wins, so nobody has to decide alone.',
    body: [
      'Everyone joins a session and swipes through nearby spots pulled from Google Places; the first option to clear a majority wins the room. Built as an installable PWA so it feels native on a phone.',
      'One Cloudflare Durable Object per session holds the live vote state over WebSockets, backed by D1/Drizzle. It handles the messy realtime cases: a host who leaves is auto-promoted so a session never stalls, and stale sessions are pruned on a cron.',
    ],
    stack: ['Cloudflare Workers', 'Hono', 'Durable Objects', 'D1', 'Drizzle', 'PWA', 'React'],
    mark: 'wherever',
    shortName: 'wherever',
    tagline: 'Swipe. Eat. No arguing.',
    link: { label: 'Open wherever', url: 'https://wherever.aidenjang.com' },
  },
  {
    title: 'bloomnote: write a note, grow a garden',
    context: 'Side project',
    summary: 'Leave someone a note and an LLM grows them a one-of-a-kind generative garden from it.',
    body: [
      'A small, gift-like app: you write a message, and a language model interprets it into a unique garden that blooms for the recipient. The charm is that no two notes ever grow the same thing.',
      'Runs on the same $0 Cloudflare stack as the rest. The model call is wrapped for reliability (a request timeout plus a retry) so a slow or flaky LLM degrades gracefully instead of leaving a blank page.',
    ],
    stack: ['Cloudflare Workers', 'LLM', 'TypeScript', 'React'],
    mark: 'bloomnote',
    shortName: 'bloomnote',
    tagline: 'A note, then a garden.',
    link: { label: 'Open bloomnote', url: 'https://bloomnote.aidenjang.com' },
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
