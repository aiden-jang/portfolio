import type { WorkDetail } from '../ui/WorkModal';

/** Editorial entries shown in the Work section. The first row gets a "Live"
 *  badge automatically because it has a `link`. Add new entries here.
 *
 *  Source / Architecture links: repos are private for now. When one goes public,
 *  add a `links` array to that entry and it renders as outline pills next to the
 *  primary button, e.g.:
 *      links: [
 *        { label: 'Source', url: 'https://github.com/aiden-jang/iguess' },
 *        { label: 'Architecture', url: 'https://github.com/aiden-jang/iguess/blob/main/ARCHITECTURE.md' },
 *      ],
 *  Only entries with a URL render, so leaving them off never dead-links. */
export const WORK_ITEMS: WorkDetail[] = [
  {
    title: 'A platform of shipped side projects',
    context: 'Personal platform',
    summary:
      'Several of my own apps on one $0 Cloudflare stack, tied together by federated sign-in I built and shipped as an npm SDK.',
    body: [
      'Everything runs on Cloudflare’s free tier (Workers, D1, Durable Objects) under a hard $0-hosting budget with no cold starts. The connective tissue is a federated identity service: one sign-in that every app on *.aidenjang.com trusts.',
      'The auth Worker issues an httpOnly session cookie on the parent domain, and a published npm package (@aidenjang/auth-client) is the single source of truth for the session contract. Apps never touch the session secret; they forward the cookie to /auth/me from their own Worker. It supports email + password (PBKDF2), Google OIDC, and passwordless magic links, all enforced server-side.',
      'Each app is its own repo that pins the SDK as a versioned dependency, so a change to the session contract is a deliberate version bump rather than silent drift across apps. Signing in is optional everywhere: it syncs your data across apps, but nothing gates on an account.',
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
    link: { label: 'Visit the sign-in hub', url: 'https://accounts.aidenjang.com' },
  },
  {
    title: 'iguess: realtime draw-and-guess vs an AI',
    context: 'Side project',
    summary:
      'A realtime multiplayer draw-and-guess game where an AI vision model races you to name the drawing. Five modes on one engine that has no idea AI exists.',
    body: [
      'skribbl.io-style realtime rooms, with a twist: an AI that actually looks at the canvas. The core bet is that the game timeline and the game rules are different things. The engine owns turns, scoring, and phases and contains zero game rules; each mode is a strategy plugged in through a fixed set of hooks. Five modes (classic, AI guesser, AI drawer, humans-vs-AI team battle, and a you-vs-AI duel) ride on that one unchanged engine.',
      'One Cloudflare Durable Object per room is the single writer for that room’s WebSocket and game state, so the roster and stroke log live in memory with no external store and no cross-instance race. A separate Worker rasterizes the live strokes to a PNG and calls a vision model behind a provider fallback chain (a paid key, then free Workers AI, then a mock), so a guess never hard-fails. The whole system ported from a Node/ws/Redis process onto Cloudflare with the engine and modes unchanged.',
      'Built to run in production, not just to demo: abuse limits enforced server-side at three layers (a per-IP edge rate limit, a per-room player cap, a per-connection flood bucket) plus a per-room AI-spend budget, reconnect that preserves identity and score with a grace window, a committed test suite, and CI that gates every deploy.',
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
    moment: 'turning a bad doodle into a tiny event',
    principle:
      'The AI plays by the same rules, gets a score, and is allowed to be gloriously wrong. It is part of the game, not a feature bolted onto the side.',
    link: { label: 'Play iguess', url: 'https://iguess.aidenjang.com' },
  },
  {
    title: 'owewell: split bills, settle up',
    context: 'Side project',
    summary:
      'A live bill-splitting app that untangles who owes whom and computes the fewest payments to settle up.',
    body: [
      'Groups, itemized expenses, and three split methods (evenly, by shares, or exact amounts), all synced live over a Durable Object session. Money is stored as integer cents from end to end, so floating-point drift never creeps into a balance.',
      'The settle-up step reduces the debt graph to a minimal set of transactions, so a group of eight settles in a handful of payments instead of dozens. Built on Hono + D1/Drizzle with React/Vite/Tailwind on top, and pay links deep-link straight into the right payment app with the amount prefilled.',
    ],
    stack: ['Cloudflare Workers', 'Hono', 'D1', 'Drizzle', 'Durable Objects', 'React'],
    mark: 'owewell',
    shortName: 'owewell',
    tagline: 'Who owes who, no drama.',
    moment: 'ending the trip without spreadsheet energy',
    principle:
      'The product does the awkward arithmetic quietly, then leaves people with the smallest possible set of things to settle.',
    link: { label: 'Open owewell', url: 'https://owewell.aidenjang.com' },
  },
  {
    title: 'wherever: group restaurant picking',
    context: 'Side project',
    summary:
      'A group picks where to eat by swiping; majority wins the room, so nobody has to be the one who decides.',
    body: [
      'Everyone joins a session and swipes through nearby spots pulled from Google Places; the first option to clear a majority wins the room. Built as an installable PWA so it feels native on a phone.',
      'One Cloudflare Durable Object per session holds the live vote state over WebSockets, backed by D1/Drizzle. It handles the realtime edge cases that make or break a group app: a host who leaves is auto-promoted so a session never stalls, votes are reconciled authoritatively on the server, and stale sessions are pruned on a cron so the free tier stays clean.',
    ],
    stack: ['Cloudflare Workers', 'Hono', 'Durable Objects', 'D1', 'Drizzle', 'PWA', 'React'],
    mark: 'wherever',
    shortName: 'wherever',
    tagline: 'Swipe. Eat. No arguing.',
    moment: 'escaping the group-chat decision spiral',
    principle:
      'Majority is intentional: one person can have a preference without holding dinner hostage.',
    link: { label: 'Open wherever', url: 'https://wherever.aidenjang.com' },
  },
  {
    title: 'bloomnote: write a note, grow a garden',
    context: 'Side project',
    summary:
      'Leave someone a note and a language model grows them a one-of-a-kind generative garden from it.',
    body: [
      'A small, gift-like app: you write a message, and a language model interprets it into a unique garden that blooms for whoever opens it. The charm is that no two notes ever grow the same thing.',
      'Runs on the same $0 Cloudflare stack as the rest. The model call is wrapped for reliability with a request timeout and a retry, so a slow or flaky LLM degrades to a graceful fallback instead of leaving a blank page.',
    ],
    stack: ['Cloudflare Workers', 'LLM', 'TypeScript', 'React'],
    mark: 'bloomnote',
    shortName: 'bloomnote',
    tagline: 'A note, then a garden.',
    moment: 'making a specific feeling feel kept',
    principle:
      'The note is the design brief, so the generated garden answers the person instead of producing greeting-card filler.',
    link: { label: 'Open bloomnote', url: 'https://bloomnote.aidenjang.com' },
  },
  {
    title: 'mrrp: a cat that belongs to exactly two people',
    context: 'Side project',
    summary:
      'One private link, two seats, and a hand-drawn pixel cat that becomes whoever you sent the link to. The interesting part is everything I refused to build.',
    body: [
      'You make a room and send the link to one person. Whoever opens it second is the one the cat is: they tap how their day is going, the cat becomes that, and from the other side you see it and can do something about it. No accounts, no database, no notifications.',
      'Three rules mattered more than any feature. Nothing bad can happen to the cat. No hunger, streaks, or decay. The second a shared pet can be neglected, it becomes a chore. The cat also does not copy a low mood. If you are sad, she comes over and stays. And you only see what the other person did, never whether they saw yours. Knowing someone saw a message and did nothing can feel worse than not knowing.',
      'One Durable Object per room is the whole backend: two seats assigned by arrival order, enforced in the object rather than the UI, because the link is the only credential the app has. The room runs on her clock, not the server\u2019s, so the light moves across the floor over her day and the cat waits by the door around the time she usually gets home. Notes arrive one a day and advance on her reading, capped once per her local day, so a day she does not visit is not a note she never sees.',
      'The art is hand-authored pixel grids you can read in the source, one aligned rectangle per logical pixel with no upscaling, because resampling a small canvas leaves you with pixels of two different sizes and it reads as a mistake rather than a style. It installs to a home screen, opens from cache with no signal, and a third person holding the link gets no notes, no mood, and a 403 on anything that writes.',
    ],
    stack: ['Cloudflare Workers', 'Durable Objects', 'React', 'Canvas', 'TypeScript', 'PWA'],
    mark: 'mrrp',
    shortName: 'mrrp',
    tagline: 'One of you is the cat.',
    moment: 'being close without needing to perform closeness',
    principle:
      'There are no streaks, guilt, or read receipts. The cat responds to a hard day, so nobody has to pretend they are fine just to keep the app happy.',
    link: { label: 'Make a room', url: 'https://mrrp.aidenjang.com' },
  },
  {
    title: 'Monolith → Django REST + React rewrite',
    context: 'Zeta Global · 2024–present',
    summary: 'Co-led the platform’s migration off a legacy PHP monolith. Django REST + React.',
    body: [
      'Co-led a platform-wide migration from a legacy PHP monolith to a Django REST API that now powers self-service native-ad onboarding across 30,000+ active publisher newsletters.',
      'Owned both ends: data modeling and Django serializers on the backend, React + TypeScript components and hooks on the frontend. Shipped continuously alongside the live system, with feature flags routing traffic onto the new stack incrementally rather than in a risky big-bang cutover.',
    ],
    stack: ['Django', 'Python', 'REST', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    title: 'Agentic AI Playwright framework',
    context: 'Zeta Global',
    summary: 'A Playwright framework where LLM agents write and self-heal E2E tests.',
    body: [
      'A three-stage pipeline: a Planner reads a feature spec and decomposes it into test scenarios, a Generator turns each scenario into a runnable Playwright spec, and a Healer watches for flakes and rewrites selectors and waits when a DOM change shifts the page out from under existing tests.',
      'Stood up baseline frontend E2E coverage across the platform without burning weeks hand-rolling fixtures.',
    ],
    stack: ['Playwright', 'TypeScript', 'Claude API', 'Node.js'],
  },
  {
    title: 'Ad Slot Details: 120 → 1 API call',
    context: 'Zeta Global',
    summary:
      'Cut a page ad ops and clients use daily from 120 API calls per load down to one, and 60s to 2s.',
    body: [
      'The page eagerly loaded every linked line item, one API call each, so a slot with a hundred of them made a hundred round-trips before anything rendered. I consolidated them into a single batched endpoint returning exactly the joined data the page needs.',
      'Load time went from “go get coffee” to instant. The internal ops and sales teams who used it daily said thanks in #engineering.',
    ],
    stack: ['Django', 'REST', 'React', 'TypeScript', 'PostgreSQL'],
  },
  {
    title: 'Sponsorships, Audience Extension, Blackout Periods',
    context: 'Zeta Global',
    summary: 'Three publisher-config products at Zeta. Data models, APIs, UIs, owned end to end.',
    body: [
      'Sponsorships v1.0: creatives + demand controls for publisher monetization across media groups, sensitive categories, and RTB exchange settings.',
      'Audience Extension: campaign scheduling with bulk DMA / zip-code audience targeting.',
      'Blackout Periods: time-window controls that suppress specific creatives or exchanges. Owned the data models, Django REST APIs, and React/TypeScript UIs for all three.',
    ],
    stack: ['Django', 'REST', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    title: 'Creative Mapping v2',
    context: 'LiveIntent · 2023–2024',
    summary: 'Owned Creative Mapping v2 end to end across MySQL, REST, and Angular.',
    body: [
      'Creative-to-placement targeting for the ad-serving XML pipeline. Designed the MySQL schema for the new mapping model, built the REST API on the legacy backend, and delivered the Angular UI publisher ops uses to configure targeting rules.',
      'Shipped alongside a stack of related work: third-party demand controls for RTB native + hybrid slots, five publisher data migrations, and the fix for a critical search-endpoint performance regression.',
    ],
    stack: ['MySQL', 'PHP', 'REST', 'Angular', 'TypeScript', 'XML'],
  },
];
