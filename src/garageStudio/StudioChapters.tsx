import { chapters, type Chapter } from './state';

export function StudioChapters({
  chapter,
  onSelect,
}: {
  chapter: Chapter;
  onSelect: (chapter: Chapter) => void;
}) {
  return (
    <div className="garage-studio-row studio-chapters" aria-label="Garage views" role="group">
      {(['walk', 'detail', 'lineup'] as const).map((name) => (
        <button key={name} aria-pressed={chapter === name} onClick={() => onSelect(name)}>
          {chapters[name]}
        </button>
      ))}
    </div>
  );
}
