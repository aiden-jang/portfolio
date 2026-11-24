export const bloomExamples = [
  {
    label: 'A walk home',
    sentence: 'You waited in the rain, made me laugh, and walked me all the way home.',
    notes: [
      'You stayed, even when the rain came down.',
      'You made a wet walk feel like something to look forward to.',
      'I’d keep the whole way home, bad weather and all.',
    ],
  },
  {
    label: 'Sunday coffee',
    sentence: 'You made coffee, put on our favorite record, and let the morning take its time.',
    notes: [
      'You made the coffee before there was anything else to do.',
      'Our favorite record made the room feel like ours.',
      'I’d keep a morning that didn’t have to hurry.',
    ],
  },
  {
    label: 'A small rescue',
    sentence: 'You picked up the phone when I called, listened, and made the day feel lighter.',
    notes: [
      'The first thing that mattered was that you picked up.',
      'Being listened to made the day feel a little lighter.',
      'I’d keep the way you made room for me to finish.',
    ],
  },
];

export function localBloomNotes(sentence: string) {
  const exact = bloomExamples.find((example) => example.sentence === sentence);
  if (exact) return exact.notes;
  const words = sentence.replace(/[.!?]+$/, '') || sentence;
  const parts = words
    .split(/\s*[,;—]\s*|\s+and\s+/i)
    .map((part) => part.replace(/^and\s+/i, '').trim())
    .filter(Boolean);
  const quote = (part: string) => '“' + part + '”';
  return [
    parts.length >= 2 ? quote(parts[0]!) : quote(words),
    parts.length >= 3 ? quote(parts.slice(1, -1).join(', ')) : 'A detail I wanted to remember.',
    parts.length >= 2 ? quote(parts.at(-1)!) : 'A flower to keep with the note.',
  ];
}
