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
    description: 'Explore earthquakes, storms, volcanoes and more on one interactive globe.',
    caption: 'Live globe: storm radar, aurora forecasts and reported events explored together.',
  },
  worth: {
    image: '/projects/worth.jpg',
    description: 'Rank what you try and remember what deserves another go.',
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
    image: '/projects/wherever-winner.webp',
    description: 'Swipe on nearby restaurants together and let the group pick dinner.',
    caption: 'Noodle Situation won the local sample round, with tacos and pizza as backups.',
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
      'An open-source IDE with an AI agent. My contributions make command approvals reusable and agent edits reversible.',
    caption:
      'Editor overview. Approval and undo changes are documented in my GitHub contributions.',
  },
};
