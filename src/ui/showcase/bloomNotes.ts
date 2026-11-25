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
  const parts = bloomPhrases(words);
  const quote = (part: string) => '“' + part + '”';
  return [
    parts[0] ? quote(parts[0]) : quote(words),
    parts[1] ? quote(parts[1]) : 'A detail I wanted to remember.',
    parts[2] ? quote(parts[2]) : 'A flower to keep with the note.',
  ];
}

export function bloomPhrases(sentence: string) {
  const parts = sentence.split(/\s*[,;—]\s*|\s+and\s+/i);
  let end = 0;
  const ranges = parts.flatMap((part) => {
    const start = part ? sentence.indexOf(part, end) : end;
    end = start + part.length;
    const phrase = part.trim().replace(/^and\s+/i, '');
    return phrase
      ? [{ start: start + part.indexOf(phrase, part.length - part.trimStart().length), phrase }]
      : [];
  });
  if (ranges.length < 3) {
    return [ranges[0]?.phrase ?? '', '', ranges[1]?.phrase ?? ''];
  }
  const tail = ranges.at(-2)!;
  return [
    ranges[0]!.phrase,
    sentence.slice(ranges[1]!.start, tail.start + tail.phrase.length),
    ranges.at(-1)!.phrase,
  ];
}
