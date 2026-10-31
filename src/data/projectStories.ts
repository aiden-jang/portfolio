export type EngineeringStepArt = 'browser' | 'worker' | 'accounts' | 'feeds' | 'records' | 'globe';

export type EngineeringStory = {
  summary: string;
  steps: { title: string; detail: string; art: EngineeringStepArt }[];
  failure: { title: string; detail: string };
  tradeoff: string;
};

type ProjectStory = {
  problem: string;
  result: string;
  decision?: string;
  built?: string;
  engineering?: EngineeringStory;
};

export const PROJECT_STORIES: Record<string, ProjectStory> = {
  iodine: {
    built:
      'My changes covered command approval rules and the feedback loop between file edits and the agent.',
    problem:
      'An IDE agent needs a useful way to reuse command approvals and undo edits without granting blanket permission.',
    decision:
      'I scoped similarity matching to approved commands and paths, kept embeddings local and added snapshots before agent edits.',
    result:
      'Approvals can be reviewed and revoked. Reverting a file also tells the agent its edit was undone, so the conversation stays in sync with the code.',
  },
  auth: {
    decision:
      'I put sign-in in one service and published a shared library for checking sessions. Each app chooses when to adopt a new version.',
    problem:
      'Every new app needed sign-in, recovery, and sessions. Rebuilding those each time meant more places for the same contract to drift.',
    result:
      'One account works across the apps. Each app pins a published SDK version and resolves identity without direct access to the session database.',
    engineering: {
      summary: 'Apps ask Accounts to resolve identity on the server through a versioned client.',
      steps: [
        {
          title: 'Browser',
          detail: 'The HttpOnly session cookie travels with the app request.',
          art: 'browser',
        },
        {
          title: 'App Worker',
          art: 'worker',
          detail: 'The auth client forwards the cookie to Accounts’ /auth/me endpoint.',
        },
        {
          title: 'Accounts + D1',
          art: 'accounts',
          detail: 'The service checks the session hash and expiry, then returns the user.',
        },
      ],
      failure: {
        title: 'When Accounts cannot answer',
        detail:
          'A network failure or 503 response resolves to unavailable. A 401 or 403 resolves to signed out. Consumers can distinguish a service outage from an expired session.',
      },
      tradeoff:
        'Central verification adds a network dependency. In return, apps share one session contract and never need direct access to the identity database.',
    },
  },
  everythingisfine: {
    built: 'An interactive globe that brings natural-event feeds into one explorable view.',
    decision:
      'I kept each source’s readings visible when matching reports, and put the camera and filters in the URL.',
    problem:
      'Natural events arrive through different feeds, at different speeds. The globe needs to show earthquakes, storms, volcanoes, fires, floods and aurora without making every source look equally certain.',
    result:
      'Earthquakes retain both agencies’ readings and magnitude scales. A shared link restores the camera, filters and pinned event.',
    engineering: {
      summary: 'Two earthquake feeds enter one store without losing their separate readings.',
      steps: [
        {
          title: 'Receive',
          art: 'feeds',
          detail: 'USGS polling and an EMSC WebSocket report events and revisions.',
        },
        {
          title: 'Match + retain',
          art: 'records',
          detail:
            'Time, distance and magnitude identify likely matches. Both readings stay attached.',
        },
        {
          title: 'Explore + share',
          art: 'globe',
          detail: 'The globe shows source details; the URL restores the view and selected event.',
        },
      ],
      failure: {
        title: 'When a feed disconnects',
        detail:
          'A dropped EMSC socket reconnects with backoff while USGS keeps polling. The interface reports feed availability instead of presenting a partial view as complete.',
      },
      tradeoff:
        'Matching is a heuristic: nearby events can be ambiguous. Keeping both agencies’ readings visible makes disagreement inspectable instead of hiding it behind one blended value.',
    },
  },
  worth: {
    built: 'Ranked collections with revisit logs and shareable lists.',
    decision:
      'I kept rankings separate from calls and revisits, so changing your mind does not erase what happened last time.',
    problem: 'It’s easy to forget which things you liked, and why you wanted to try them again.',
    result:
      'A drink can move up your ranking after a second visit. Its original note and revisit history stay together; sharing a list keeps those private details out.',
  },
  owewell: {
    problem: 'A shared bill gets complicated when everyone ordered something different.',
    result:
      'People can split evenly, by shares, or by exact amounts. Balances stay in integer cents, and settlement suggestions reduce the payments needed to close the group.',
  },
  iguess: {
    problem: 'An AI drawing game still needs fair turns, scoring, and reliable multiplayer rooms.',
    result:
      'Five modes share one engine. Players can recover their identity and score after a brief disconnect, and model requests can try another provider when one fails.',
  },
  wherever: {
    problem: '“Anywhere is fine” rarely gets a group any closer to dinner.',
    result:
      'In majority mode, the first restaurant to clear the threshold wins. The server resolves votes and replaces a departed host after a grace period.',
  },
  bloomnote: {
    built: 'A note composer and an illustrated garden the recipient can open through a link.',
    decision:
      'I used structured model output for real flower species and personal meanings, then validated it before rendering the garden.',
    problem: 'A personal note deserves something more specific than a generic greeting card.',
    result:
      'The link opens straight into the recipient’s garden. Each flower carries a meaning from the note.',
  },
  mrrp: {
    built: 'A shared room with a pixel cat, mood check-ins and notes for two people.',
    decision:
      'I enforced the two seats on the server and let notes wait for the recipient. Streaks and penalties stayed out.',
    problem: 'Keeping someone company from a distance shouldn’t become another obligation.',
    result:
      'Two people share a room through one link. Notes wait until they’re read, and a hard day brings the cat closer. Missing a day doesn’t cost anything.',
  },
};

export const CAREER_STORIES: Record<string, { problem: string; decision: string; result: string }> =
  {
    'monolith-django-rest-react-rewrite': {
      problem:
        'A legacy PHP monolith was carrying a live publisher platform while its replacement was being built.',
      decision:
        'I worked across PostgreSQL models, Django REST and React, keeping the API and interface aligned with the other engineer during the migration.',
      result:
        'Two engineers completed the backend migration in six months. The platform serves more than 30,000 active publisher newsletters.',
    },
    'agentic-ai-playwright-framework': {
      problem:
        'The platform had no automated coverage, and its interface was being migrated from Angular to React.',
      decision:
        'I separated planning, test generation and repair, so interface changes could be handled without rewriting every spec by hand.',
      result:
        'The framework became the platform’s first automated coverage and continues to run in a frontend package after the monorepo migration.',
    },
    'ad-slot-details-120-1-api-call': {
      problem:
        'Opening a slot fetched each linked line item separately. Large slots made around 120 API calls before the page was ready.',
      decision:
        'I returned the joined data through one batched endpoint instead of asking the browser to fetch every line item separately.',
      result:
        'API calls dropped from 120 to one, and page load time fell from about 60 seconds to two.',
    },
    'sponsorships-audience-extension-blackout-periods': {
      problem:
        'Publisher teams needed scheduling and demand controls that could handle more than one line item or newsletter per sponsorship.',
      decision:
        'I chose a many-to-many model before launch, then worked with a designer on the interface. A one-to-one model would limit live sponsorships later.',
      result:
        'Shipped the data models, APIs, and interfaces for three products. Sponsorships serves hundreds of millions of impressions a week, including The Washington Post.',
    },
    'creative-mapping-v2': {
      problem:
        'Publisher ops needed to configure which creatives could target which placements in the ad-serving pipeline.',
      decision:
        'I owned the MySQL model, REST API and Angular editor together, keeping targeting rules consistent from configuration to delivery.',
      result:
        'Delivered Creative Mapping v2 end to end, alongside publisher migrations and demand controls.',
    },
    'google-ad-manager-native-integration': {
      problem: 'Publisher configuration needed to reach the native-ad delivery pipeline.',
      decision:
        'I built the endpoints, geo-targeting and Native Ad Slot support in the generated XML.',
      result:
        'The integration connected publisher settings to Google Ad Manager native ad serving.',
    },
    'publisher-account-migrations': {
      problem:
        'Inventory, campaigns and permissions needed to move between publisher accounts together.',
      decision:
        'I wrote transactional scripts so a failed step would not leave a partial migration.',
      result: 'I ran 13 migrations, including BuzzFeed and Dotdash Meredith.',
    },
  };
