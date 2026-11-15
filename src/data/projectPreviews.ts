export type PreviewState = { image: string; label: string; caption: string };
export type ProductPreview = {
  image: string;
  description: string;
  caption: string;
  states?: PreviewState[];
};
export const PREVIEWS: Record<string, ProductPreview> = {
  everythingisfine: {
    image: '/projects/everythingisfine.jpg',
    description:
      'Explore earthquakes, storms, volcanoes, wildfires, floods and aurora on one globe, with the source details intact.',
    caption: 'Live globe: storm radar, surface wind and reported events explored together.',
  },
  worth: {
    image: '/projects/worth.jpg',
    description:
      'For keeping track of your own taste: rank what you try and remember what deserves another go.',
    caption:
      'A drinks collection with Favorite and Not again calls, and the selected item’s opinion.',
  },
  owewell: {
    image: '/projects/owewell.jpg',
    description: 'Split a group’s expenses and see who pays whom to settle up.',
    caption: 'Example split: a $48 bill for You and Alex, with $24 due back.',
  },
  auth: {
    image: '/projects/platform.jpg',
    description:
      'One account across the apps, with shared sign-in, recovery, and account settings.',
    caption: 'The signed-in app hub: one account connects the apps in one place.',
  },
  iguess: {
    image: '/projects/iguess.jpg',
    description: 'Draw with friends while an AI races to guess. Bad drawings are welcome.',
    caption:
      'An AI Guesser round: a turnstile sketch, an active timer and the AI’s guess, “square.”',
  },
  wherever: {
    image: '/projects/wherever.jpg',
    description: 'Swipe on nearby restaurants together and let the group pick dinner.',
    caption: 'Restaurant voting: photos, price, travel estimate, veto and super-like in one room.',
  },
  bloomnote: {
    image: '/projects/bloomnote-garden.jpg',
    states: [
      {
        image: '/projects/bloomnote-garden.jpg',
        label: 'Open the garden',
        caption: 'Example garden for Sarah, with a gerbera’s meaning open.',
      },
      {
        image: '/projects/bloomnote-full.jpg',
        label: 'Read the note',
        caption: 'The full recipient view: the garden, personal note and meanings of its flowers.',
      },
    ],
    description: 'Send someone a personal note as a garden, with flowers shaped by what you wrote.',
    caption: 'Example garden for Sarah, with a gerbera’s meaning open.',
  },
  mrrp: {
    image: '/projects/mrrp-room.jpg',
    description: 'A private room for two, a pixel cat, and small ways to keep each other company.',
    caption: 'Bean’s room, with the cat, notes and small things to leave out.',
  },
  iodine: {
    image: '/projects/iodine.png',
    description:
      'An open-source IDE where I contributed scoped command approvals and agent edit undo.',
    caption: 'Iodine’s editor beside its coding assistant explaining the selected code.',
  },
};
