import { ProjectPair } from './showcase/ProjectPair';
import { FlowWalkthrough } from './showcase/FlowWalkthrough';
import { StoryScreenshot } from './StoryScreenshot';
import { workId } from '../data/workItems';
import type { WorkDetail } from '../types';
import { PREVIEWS } from '../data/projectPreviews';
import { CAREER_STORIES, PROJECT_STORIES } from '../data/projectStories';
import './work-story.css';
import { usePreviewSelection } from './usePreviewSelection';
import { EngineeringStory } from './EngineeringStory';

export function WorkStory({ item }: { item: WorkDetail }) {
  const projectStory = PROJECT_STORIES[item.mark ?? item.shortName ?? ''];
  const story = projectStory ?? CAREER_STORIES[workId(item)];
  const decision = story?.decision ?? item.principle;
  const preview = PREVIEWS[item.mark ?? ''];
  const [selected] = usePreviewSelection(item.shortName ?? '', preview?.states?.length ?? 1);
  const view = preview?.states?.[selected] ?? preview;
  const featured = item.mark === 'everythingisfine' || item.mark === 'iodine';
  const overview = (
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
      {item.mark === 'auth' && <ProjectPair name="platform" />}
      {preview &&
        item.mark !== 'auth' &&
        (item.mark !== 'bloomnote' || view?.image !== preview.image) && (
          <StoryScreenshot
            image={view?.image ?? preview.image}
            name={item.shortName ?? item.title}
            caption={view?.caption ?? preview.caption}
          />
        )}
    </div>
  );
  return (
    <div className="work-story">
      {featured ? (
        <details className="featured-story-context">
          <summary>
            {item.contribution
              ? 'Command approvals and editor'
              : 'The app and the design decisions'}
          </summary>
          {overview}
        </details>
      ) : (
        overview
      )}
      {item.shortName === 'iguess' && <FlowWalkthrough />}
      {projectStory?.engineering && (
        <EngineeringStory story={projectStory.engineering} id={workId(item)} />
      )}
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
