import type { WorkDetail } from '../types';
import { PREVIEWS } from '../data/projectPreviews';
import { PROJECT_STORIES } from '../data/projectStories';
import './work-story.css';

export function WorkStory({ item }: { item: WorkDetail }) {
  const story = PROJECT_STORIES[item.mark ?? ''];
  const preview = PREVIEWS[item.mark ?? ''];
  return (
    <div className="work-story">
      <div className="work-story-overview">
        <div>
          <section>
            <h4>{story ? 'The problem' : 'The work'}</h4>
            <p>{story?.problem ?? item.body[0]}</p>
          </section>
          {item.principle && (
            <section>
              <h4>The decision</h4>
              <p>{item.principle}</p>
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
