import { useGarageExhibit } from '../garageExhibits/state';
import { chapters, type Chapter } from './state';

export function StudioChapters({
  chapter,
  onSelect,
}: {
  chapter: Chapter;
  onSelect: (chapter: Chapter) => void;
}) {
  const exhibit = useGarageExhibit((state) => state.exhibit);
  return (
    <div className="garage-studio-row studio-chapters" aria-label="Garage views" role="group">
      {(Object.keys(chapters) as Chapter[]).map((name) => (
        <button key={name} aria-pressed={chapter === name} onClick={() => onSelect(name)}>
          {name === 'light' && exhibit !== 'free' ? 'Lighting' : chapters[name]}
        </button>
      ))}
    </div>
  );
}
