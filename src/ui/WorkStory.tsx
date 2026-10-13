import { ScreenshotImage } from './ScreenshotImage';
import { workId } from '../data/workItems';
import type { WorkDetail } from '../types';
import { PREVIEWS } from '../data/projectPreviews';
import { CAREER_STORIES, PROJECT_STORIES } from '../data/projectStories';
import './work-story.css';
import { usePreviewSelection } from './usePreviewSelection';

export function WorkStory({ item }: { item: WorkDetail }) {
  const projectStory = PROJECT_STORIES[item.mark ?? item.shortName ?? ''];
  const story = projectStory ?? CAREER_STORIES[workId(item)];
  const decision = story?.decision ?? item.principle;
  const preview = PREVIEWS[item.mark ?? ''];
  const [selected] = usePreviewSelection(item.shortName ?? '', preview?.states?.length ?? 1);
  const view = preview?.states?.[selected] ?? preview;
  return (
    <div className="work-story">
      <p className="project-role">
        {item.contribution
          ? 'Open-source contributor'
          : item.mark
            ? 'Designed & built'
            : item.context}
      </p>
      <div className="work-story-overview">
        <div>
          <section>
            <h4>{item.contribution ? 'My contribution' : 'The brief'}</h4>
            <p>{item.contribution ? projectStory?.built : (story?.problem ?? item.summary)}</p>
          </section>
          {decision && (
            <section>
              <h4>The key decision</h4>
              <p>{decision}</p>
            </section>
          )}
          {story && (
            <section>
              <h4>The result</h4>
              <p>{story.result}</p>
            </section>
          )}
        </div>
        {preview && (
          <figure>
            <ScreenshotImage
              key={view?.image}
              src={view?.image ?? preview.image}
              alt={`${item.shortName} product interface`}
            />
            <figcaption>{view?.caption}</figcaption>
          </figure>
        )}
      </div>
      {item.body.length > 1 && (
        <details>
          <summary>Engineering details</summary>
          <div>
            {(story ? item.body : item.body.slice(1)).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
