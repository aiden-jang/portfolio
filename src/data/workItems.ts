import type { WorkDetail } from '../types';

/** The `#work/...` fragment for an entry. Two entries sharing one would share a URL. */
export function workId(item: WorkDetail): string {
  return (item.shortName ?? item.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// An entry's "Live" badge comes from it having a `link`, not from a flag of its own.
export const WORK_ITEMS: WorkDetail[] = [
  {
    title: 'A platform of shipped side projects',
    context: 'Personal platform',
    summary: 'I built one sign-in service for my apps and a shared library for checking sessions.',
    body: [
      'The accounts service handles identity for the apps on aidenjang.com. It runs on Cloudflare Workers, with D1 and Durable Objects supporting storage and rate limits.',
      'Apps forward the shared session cookie to /auth/me through @aidenjang/auth-client, without accessing the identity database. The service supports email and password, Google sign-in and passkeys.',
      'Each app pins an SDK version and decides which actions require a session. A contract change gets a version bump rather than silently changing every app.',
    ],
    stack: [
      'Cloudflare Workers',
      'Durable Objects',
      'D1',
      'OIDC',
      'npm SDK',
      'TypeScript',
      'React',
    ],
    mark: 'auth',
    shortName: 'platform',
    tagline: 'One login, every app.',
    categories: ['systems'],
    link: { label: 'Visit the sign-in hub', url: 'https://accounts.aidenjang.com' },
    links: [{ label: 'Source code', url: 'https://github.com/aiden-jang/auth' }],
  },
  {
    title: 'everythingisfine: the planet, live',
    context: 'Side project',
    summary:
      'I built a live globe for natural events, matching differing earthquake reports while keeping their source details visible.',
    body: [
      'The globe brings earthquakes, storms, volcanoes, wildfires, floods and aurora into one view. Hover for a summary, pin an event, or share a link that restores the camera and filters.',
      'USGS polling and EMSC WebSockets report the same earthquakes with different identifiers, times, locations and magnitude scales. I built reconciliation that groups those reports while keeping their source readings visible.',
      'The interface distinguishes source counts from matched events and labels incomplete time windows and accelerated wavefront playback. A moving globe should not imply more certainty than the feeds provide.',
    ],
    stack: ['Three.js', 'WebGL', 'TypeScript', 'React', 'WebSockets', 'Cloudflare'],
    mark: 'everythingisfine',
    shortName: 'everythingisfine',
    tagline: 'The planet, live.',
    categories: ['realtime', 'systems'],
    moment: 'wanting to know what the planet is up to without a news cycle attached',
    principle:
      'Keep source readings visible when agencies disagree. The globe is a way to explore the data, not smooth over its differences.',
    link: { label: 'Open everythingisfine', url: 'https://everythingisfine.aidenjang.com' },
    links: [{ label: 'Source code', url: 'https://github.com/aiden-jang/everythingisfine' }],
  },
  {
    title: 'worth: keep your own taste',
    context: 'Side project',
    summary:
      'I built a personal archive with ranked collections, revisit history and workout logs. The calls are Favorite, Meh and Not again.',
    body: [
      'Collections hold things you try; activities hold dated records such as gym sessions. Rankings, calls, notes and photos answer different questions, so I kept them separate.',
      'A Cloudflare Worker serves the React app and API, with D1 storing records and small photos. Private routes verify the accounts session. Shared rankings are fixed snapshots: they expire after seven days and can be revoked, with notes, dates, history and photos excluded.',
      'The archive starts empty. Search, exports, photo-inclusive backups and validated restore make records easier to find and take elsewhere.',
    ],
    stack: ['React', 'TypeScript', 'Cloudflare Workers', 'D1', 'Hono'],
    mark: 'worth',
    shortName: 'worth',
    tagline: 'Keep the good stuff. Meh is also a valid answer.',
    categories: ['social', 'systems'],
    moment: 'remembering whether something deserves another go',
    principle:
      'A personal opinion can stay small: Favorite, Meh, or Not again. Ranking and revisits add context without turning taste into a public score.',
    link: { label: 'Open worth', url: 'https://worth.aidenjang.com' },
  },
  {
    title: 'iguess: real-time draw-and-guess vs an AI',
    context: 'Side project',
    summary:
      'I built five drawing-game modes on one turn and scoring engine, with live rooms and AI players.',
    body: [
      'The engine handles turns, scoring and phases; mode-specific rules plug into a shared interface. Classic play, AI guessing, AI drawing, team battles and duels use the same engine.',
      'One Durable Object owns each room’s WebSocket state and stroke log. An AI Worker rasterizes strokes and tries available vision providers, with a mock provider as a fallback. The Worker reports an error if no provider succeeds.',
      'Server-side rate limits, room and connection caps, and an AI-spend budget bound the workload. Reconnecting players can recover their identity and score within a grace window.',
    ],
    stack: [
      'Cloudflare Workers',
      'Durable Objects',
      'WebSockets',
      'Canvas',
      'Vision LLM',
      'TypeScript',
      'React',
    ],
    mark: 'iguess',
    shortName: 'iguess',
    tagline: 'Pictionary vs. a robot.',
    categories: ['realtime', 'ai', 'social'],
    moment: 'turning a bad doodle into a tiny event',
    principle:
      'The AI plays by the same rules, gets a score, and is allowed to be gloriously wrong. It is part of the game, not a feature bolted onto the side.',
    link: { label: 'Play iguess', url: 'https://iguess.aidenjang.com' },
  },
  {
    title: 'owewell: split bills, settle up',
    context: 'Side project',
    summary:
      'I built shared expense editing and settlement suggestions, storing money as whole cents in both the app and API.',
    body: [
      'Groups can split expenses evenly, by shares or by exact amounts. A Durable Object syncs changes, while integer cents keep the arithmetic consistent between the API and interface.',
      'Settlement suggestions match debtors with creditors to produce a short payment list. Payment links carry the amount into supported payment apps.',
    ],
    stack: ['Cloudflare Workers', 'Hono', 'D1', 'Drizzle', 'Durable Objects', 'React'],
    mark: 'owewell',
    shortName: 'owewell',
    tagline: 'Who owes whom, no drama.',
    categories: ['realtime', 'social'],
    moment: 'ending the trip without spreadsheet energy',
    principle:
      'Handle the arithmetic first, then show people a short list of payments to settle the group.',
    link: { label: 'Open owewell', url: 'https://owewell.aidenjang.com' },
  },
  {
    title: 'wherever: group restaurant picking',
    context: 'Side project',
    summary:
      'I built restaurant voting that updates for everyone in the room and keeps going when the host leaves.',
    body: [
      'People join a room and swipe on nearby restaurants from Google Places. In the default majority mode, a restaurant wins once enough people vote for it. The app can be installed on a phone.',
      'One Durable Object owns the votes and WebSocket session. It replaces a departed host after a grace period, and scheduled cleanup removes stale sessions.',
    ],
    stack: ['Cloudflare Workers', 'Hono', 'Durable Objects', 'D1', 'Drizzle', 'PWA', 'React'],
    mark: 'wherever',
    shortName: 'wherever',
    tagline: 'Swipe. Eat. No arguing.',
    categories: ['realtime', 'social'],
    moment: 'escaping the group-chat decision spiral',
    principle:
      'Majority is intentional: one person can have a preference without holding dinner hostage.',
    link: { label: 'Open wherever', url: 'https://wherever.aidenjang.com' },
  },
  {
    title: 'bloomnote: write a note, grow a garden',
    context: 'Side project',
    summary:
      'I built the note composer, the service that chooses flowers and the illustrated garden the recipient opens.',
    body: [
      'The model chooses real flower species and gives each a meaning drawn from the note. Those choices become the garden’s colors and shapes; a link opens the recipient view.',
      'Generation uses structured function calling and streams progress over server-sent events. Requests have a timeout and retry handling, and flower data is validated before use. Generation failures are reported to the sender.',
    ],
    stack: ['Cloudflare Workers', 'LLM', 'TypeScript', 'React'],
    mark: 'bloomnote',
    shortName: 'bloomnote',
    tagline: 'A note, then a garden.',
    categories: ['ai', 'social'],
    moment: 'making a specific feeling feel kept',
    principle:
      'The note is the design brief, so the generated garden answers the person instead of producing greeting-card filler.',
    link: { label: 'Open bloomnote', url: 'https://bloomnote.aidenjang.com' },
  },
  {
    title: 'mrrp: a cat that belongs to exactly two people',
    context: 'Side project',
    summary:
      'I designed and built a two-person room with a pixel cat, mood check-ins and notes that wait for the recipient.',
    body: [
      'A room has two seats, enforced by its Durable Object. One person’s check-ins shape the cat’s behavior; the other can leave something for her or sit with her. Joining does not require an account.',
      'I left out hunger, streaks, decay and read receipts. A low mood brings the cat closer instead of making her another thing to look after. Missing a day does not create a debt to the app.',
      'Notes advance when the recipient reads them, with a daily limit based on their local time. The room also uses their clock for its light and daily routines.',
      'The cat and room are hand-authored pixel art rendered on canvas. The app installs to a home screen and caches its shell for offline opening; live room updates still need a connection.',
    ],
    stack: ['Cloudflare Workers', 'Durable Objects', 'React', 'Canvas', 'TypeScript', 'PWA'],
    mark: 'mrrp',
    shortName: 'mrrp',
    tagline: 'One of you is the cat.',
    categories: ['realtime', 'social'],
    moment: 'being close without needing to perform closeness',
    principle:
      'There are no streaks, guilt, or read receipts. The cat responds to a hard day, so nobody has to pretend they are fine just to keep the app happy.',
    link: { label: 'Make a room', url: 'https://mrrp.aidenjang.com' },
  },
  {
    title: 'Monolith → Django REST + React rewrite',
    displayTitle: 'Replacing a live publisher backend',
    context: 'Zeta Global · 2024–present',
    summary:
      'With one other engineer, I migrated the backend from PHP to Django REST in six months and rebuilt the interface in React.',
    body: [
      'The replacement supports publisher onboarding on a platform serving more than 30,000 active newsletters. It moved a live system from a PHP monolith to Django REST and PostgreSQL.',
      'I owned PostgreSQL models and Django serializers alongside React and TypeScript components and hooks. Working across the API and interface kept the data contract consistent during the migration.',
    ],
    stack: ['Django', 'Python', 'REST', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    title: 'Agentic AI Playwright framework',
    displayTitle: 'Tests that adapt to a changing UI',
    context: 'Zeta Global',
    summary:
      'I built the platform’s first automated tests: Playwright agents that plan, write and repair test specs.',
    body: [
      'A planner turns a feature specification into scenarios. A generator writes runnable Playwright specs, and a repair stage updates selectors and waits when the interface changes.',
      'I started it as a research project for a platform without automated tests. It became the first automated coverage and continued running after the frontend moved into a monorepo during the Angular-to-React migration.',
    ],
    stack: ['Playwright', 'TypeScript', 'Claude API', 'Node.js'],
  },
  {
    title: 'Ad Slot Details: 120 → 1 API call',
    context: 'Zeta Global',
    summary:
      'I reduced Ad Slot Details from 120 API calls to one, taking page load time from 60 seconds to two.',
    body: [
      'The page fetched each linked line item separately. I replaced those requests with one batched endpoint returning the joined data the interface needs.',
      'The change removed repeated round-trips on a page used daily by ad operations and clients.',
    ],
    stack: ['Django', 'REST', 'React', 'TypeScript', 'PostgreSQL'],
  },
  {
    title: 'Sponsorships, Audience Extension, Blackout Periods',
    context: 'Zeta Global',
    summary:
      'I owned the data models, APIs and interfaces for three publisher tools. Sponsorships serves hundreds of millions of impressions a week.',
    body: [
      'For Sponsorships, I chose a many-to-many model for line items and newsletters, plus creative scheduling. I worked with a designer on the interface and with product and operations on the model. The product is used by publishers including The Washington Post.',
      'Audience Extension adds campaign scheduling and bulk DMA and ZIP-code targeting. Blackout Periods suppress selected creatives or exchanges within a time window. I built the Django REST APIs and React interfaces for both.',
    ],
    stack: ['Django', 'REST', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    title: 'Creative Mapping v2',
    context: 'LiveIntent · 2023–2024',
    summary: 'Owned Creative Mapping v2 end to end across MySQL, REST, and Angular.',
    body: [
      'I designed the MySQL schema, built the REST API and delivered the Angular editor that publisher operations uses to map creatives to ad placements. Those rules feed the XML ad-serving pipeline.',
      'Related work included third-party demand controls, publisher migrations and a search-endpoint performance fix.',
    ],
    stack: ['MySQL', 'PHP', 'REST', 'Angular', 'TypeScript', 'XML'],
  },
  {
    title: 'Google Ad Manager native integration',
    context: 'LiveIntent · 2022–2023',
    summary: 'Built the Google Ad Manager integration for Native Ad Slots from scratch.',
    body: [
      'I built the endpoints, geo-targeting and Native Ad Slot support connecting Google Ad Manager to the XML ad-serving pipeline.',
    ],
    stack: ['REST', 'XML', 'PHP', 'Google Ad Manager'],
  },
  {
    title: 'Publisher account migrations',
    context: 'LiveIntent · 2023–2024',
    summary: 'Ran 13 publisher migrations, including BuzzFeed and Dotdash Meredith.',
    body: [
      'I wrote transactional scripts to move inventory, campaigns and permissions between publisher accounts. The migrations included BuzzFeed and Dotdash Meredith.',
    ],
    stack: ['SQL', 'MySQL', 'Data migrations'],
  },
  {
    title: 'iodine',
    shortName: 'iodine',
    contribution: true,
    tagline: 'Keep the human in control of the agent.',
    categories: ['ai', 'systems'],
    context: 'Open source · Contributor',
    summary:
      'I contributed reusable command approvals and a way to undo agent edits to an open-source TypeScript IDE.',
    body: [
      'I built scoped command approvals, normalization and local embedding suggestions for similar commands. I also tightened rule matching around command signatures and hidden paths.',
      'I added file snapshots and an undo flow that tells the agent when an edit is reverted. Other contributions covered file-path navigation, configuration and file-creation fixes.',
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'Local embeddings', 'Open source'],
    link: {
      label: 'See iodine contributions',
      url: 'https://github.com/hyunwookshin/iodine/commits/main/?author=aiden-jang',
    },
  },
];
