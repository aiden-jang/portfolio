export const PROJECT_STORIES: Record<
  string,
  { problem: string; result: string; decision?: string; built?: string }
> = {
  iodine: {
    built: 'Scoped command approvals, local similarity matching and reversible agent edits.',
    problem:
      'An IDE agent needs a useful way to reuse command approvals and undo edits without granting blanket permission.',
    decision:
      'Limit similarity matching to approved command signatures and paths, keep embeddings local and snapshot files before agent edits.',
    result:
      'Approvals can be reviewed and revoked. Reverting a file also tells the agent its edit was undone, so the conversation stays in sync with the code.',
  },
  auth: {
    decision:
      'Put identity in one service and publish the session contract as a versioned SDK. Apps can change independently without silently changing what a session means.',
    problem:
      'Every new app needed sign-in, recovery, and sessions. Rebuilding those each time meant more places for the same contract to drift.',
    result:
      'One account works across the apps. Each app pins a published SDK version and verifies sessions without holding the signing secret.',
  },
  everythingisfine: {
    built: 'An interactive globe that brings natural-event feeds into one explorable view.',
    decision:
      'Keep each source’s readings and uncertainty intact, then share the camera and filter state in the URL.',
    problem:
      'Natural events arrive through different feeds, at different speeds. The globe needs to show earthquakes, storms, volcanoes, fires, floods and aurora without making every source look equally certain.',
    result:
      'Earthquakes retain both agencies’ readings and magnitude scales. A shared link restores the camera, filters and pinned event.',
  },
  worth: {
    built: 'Ranked collections with revisit logs and shareable lists.',
    decision:
      'Keep rankings separate from calls and preserve revisit history, so a new opinion does not erase the old one.',
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
      'Five modes share the same turn and scoring engine. A reconnecting player keeps their identity and score; a failed model request has a fallback.',
  },
  wherever: {
    problem: '“Anywhere is fine” rarely gets a group any closer to dinner.',
    result:
      'The first restaurant to clear a majority wins. Votes are resolved by the server, and another person takes over if the host leaves.',
  },
  bloomnote: {
    built: 'A note composer and an illustrated garden the recipient can open through a link.',
    decision:
      'Use details from the note to choose real flower species and their meanings. Validate the model response before turning it into a garden.',
    problem: 'A personal note deserves something more specific than a generic greeting card.',
    result:
      'The link opens straight into the recipient’s garden. Each flower carries a meaning from the note.',
  },
  mrrp: {
    built: 'A shared room with a pixel cat, mood check-ins and notes for two people.',
    decision:
      'Use a shared room with persistent identity and unread notes, without streaks or penalties for staying away.',
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
        'Own the PostgreSQL models, Django REST API and React interface together so the data contract stays consistent across the replacement.',
      result:
        'Two engineers completed the backend migration in six months. The platform serves more than 30,000 active publisher newsletters.',
    },
    'agentic-ai-playwright-framework': {
      problem:
        'The platform had no automated coverage, and its interface was being migrated from Angular to React.',
      decision:
        'Separate planning, test generation, and repair into three stages so changing selectors didn’t require rebuilding every test by hand.',
      result:
        'The framework became the platform’s first automated coverage and continues to run in a frontend package after the monorepo migration.',
    },
    'ad-slot-details-120-1-api-call': {
      problem:
        'Opening a slot fetched each linked line item separately. Large slots made around 120 API calls before the page was ready.',
      decision:
        'Return the joined data the interface needs through one batched endpoint instead of asking the browser to assemble it.',
      result:
        'API calls dropped from 120 to one, and page load time fell from about 60 seconds to two.',
    },
    'sponsorships-audience-extension-blackout-periods': {
      problem:
        'Publisher teams needed scheduling and demand controls that could handle more than one line item or newsletter per sponsorship.',
      decision:
        'Choose a many-to-many model before launch. A simpler one-to-one model would require migrating live sponsorship data later.',
      result:
        'Shipped the data models, APIs, and interfaces for three products. Sponsorships serves hundreds of millions of impressions a week, including The Washington Post.',
    },
    'creative-mapping-v2': {
      problem:
        'Publisher ops needed to configure which creatives could target which placements in the ad-serving pipeline.',
      decision:
        'Own the MySQL model, REST contract, and Angular editor together so targeting rules stayed consistent from configuration to delivery.',
      result:
        'Delivered Creative Mapping v2 end to end, alongside publisher migrations and demand controls.',
    },
  };
