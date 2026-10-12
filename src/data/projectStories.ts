export const PROJECT_STORIES: Record<string, { problem: string; result: string }> = {
  auth: {
    problem: 'Separate apps shouldn’t mean maintaining separate accounts.',
    result:
      'A shared sign-in service and versioned SDK connect the apps without sharing their session secret.',
  },
  everythingisfine: {
    problem:
      'Earthquake feeds report the same event differently. Hiding the differences would imply certainty the data doesn’t have.',
    result: 'A live globe keeps both sources visible, with filters and shareable views.',
  },
  worth: {
    problem: 'It’s easy to forget which things you liked, and why you wanted to try them again.',
    result: 'Collections, rankings, and revisit logs keep your own taste useful over time.',
  },
  owewell: {
    problem: 'A shared bill gets complicated when everyone ordered something different.',
    result:
      'Itemized splits and settlement suggestions turn the group’s balances into fewer payments.',
  },
  iguess: {
    problem: 'An AI drawing game still needs fair turns, scoring, and reliable multiplayer rooms.',
    result:
      'Five modes run on one room engine. The AI takes part in the game, including getting things wrong.',
  },
  wherever: {
    problem: '“Anywhere is fine” rarely gets a group any closer to dinner.',
    result: 'Shared restaurant decks and live voting give the group a place to go.',
  },
  bloomnote: {
    problem: 'A personal note deserves something more specific than a generic greeting card.',
    result: 'The message becomes a unique garden, delivered through a link.',
  },
  mrrp: {
    problem: 'Keeping someone company from a distance shouldn’t become another obligation.',
    result:
      'A room for two offers notes and a responsive cat without streaks, decay, or read receipts.',
  },
};
