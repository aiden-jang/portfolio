export type PreviewState = { image: string; label: string; caption: string };
export type ProductPreview = {
  image: string;
  description: string;
  caption: string;
  states?: PreviewState[];
};
export const PREVIEWS: Record<string, ProductPreview> = {
  everythingisfine: {
    image: '/projects/everythingisfine.png',
    states: [
      {
        image: '/projects/everythingisfine.png',
        label: 'Explore the globe',
        caption: 'Live natural-event layers across the Pacific.',
      },
      {
        image: '/projects/everythingisfine-event.png',
        label: 'Follow a wildfire',
        caption: 'A selected wildfire keeps its source details beside the globe.',
      },
    ],
    description:
      'Earthquakes, storms, volcanoes, wildfires, floods and aurora on a live globe. Earthquake sources keep their disagreements visible.',
    caption: 'Globe view: live events across the Pacific, with natural-event layers on one planet.',
  },
  worth: {
    image: '/projects/worth-ranked.png',
    states: [
      {
        image: '/projects/worth-ranked.png',
        label: 'See the ranking',
        caption: 'Example ranked list: five drinks, in a very particular order.',
      },
      {
        image: '/projects/worth.png',
        label: 'Meet worth',
        caption: 'The public landing and its labeled example collection.',
      },
    ],
    description:
      'Rank the things you try, keep revisit logs, and remember what deserves another go.',
    caption: 'Example ranked list: five drinks, in a very particular order.',
  },
  owewell: {
    image: '/projects/owewell.png',
    description:
      'Shared expenses, itemized splits, and the smallest set of payments needed to settle up.',
    caption: 'A labeled $48 example, split three ways. Adjust the bill and the payments update.',
  },
  auth: {
    image: '/projects/platform.png',
    description:
      'One account across the apps, with shared sign-in, recovery, and account settings.',
    caption: 'One sign-in for the apps, with email, Google and account recovery.',
  },
  iguess: {
    image: '/projects/iguess.png',
    description:
      'Draw with friends while an AI races to guess. Five game modes share one room engine.',
    caption: 'Choose a game mode and an extremely qualified avatar.',
  },
  wherever: {
    image: '/projects/wherever.png',
    description: 'Swipe on nearby restaurants together and let the group pick dinner.',
    caption: 'Dinner decisions: the restaurant vote shown here is a labeled example.',
  },
  bloomnote: {
    image: '/projects/bloomnote-garden.png',
    states: [
      {
        image: '/projects/bloomnote-garden.png',
        label: 'Open the garden',
        caption: 'Example recipient view: each flower carries a meaning from the note.',
      },
      {
        image: '/projects/bloomnote.png',
        label: 'Write the note',
        caption: 'The writing desk, before the garden grows.',
      },
    ],
    description: 'Write someone a note and turn its details into a garden they can open.',
    caption: 'Example recipient view: each flower carries a meaning from the note.',
  },
  mrrp: {
    image: '/projects/mrrp-room.jpg',
    states: [
      {
        image: '/projects/mrrp-room.jpg',
        label: 'Together in the room',
        caption: 'Example shared room: a tired mood becomes an invitation to sit together.',
      },
      {
        image: '/projects/mrrp.png',
        label: 'Before moving in',
        caption: 'The public landing, before making a room for two.',
      },
    ],
    description: 'A private room for two, a pixel cat, and small ways to keep each other company.',
    caption: 'Example shared room: a tired mood becomes an invitation to sit together.',
  },
};
