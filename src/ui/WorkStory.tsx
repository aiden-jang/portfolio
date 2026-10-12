import { workId } from '../data/workItems';
import type { WorkDetail } from '../types';
import { PREVIEWS } from '../data/projectPreviews';
import { CAREER_STORIES, PROJECT_STORIES } from '../data/projectStories';
import './work-story.css';

export function WorkStory({ item }: { item: WorkDetail }) {
  const story = PROJECT_STORIES[item.mark ?? item.shortName ?? ''] ?? CAREER_STORIES[workId(item)];
  const decision = story?.decision ?? item.principle;
  const preview = PREVIEWS[item.mark ?? ''];
  return (
    <div className="work-story">
      <div className="work-story-overview">
        <div>
          <section>
            <h4>{story ? 'The problem' : 'The work'}</h4>
            <p>{story?.problem ?? item.body[0]}</p>
          </section>
          {decision && (
            <section>
              <h4>The decision</h4>
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
            <img src={preview.image} alt={`${item.shortName} product interface`} />
            <figcaption>{preview.caption}</figcaption>
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
