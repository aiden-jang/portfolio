import type { EngineeringStory as Story } from '../data/projectStories';
import './engineering-story.css';
import { SystemSketch } from './SystemSketch';

export function EngineeringStory({ story, id }: { story: Story; id: string }) {
  const caption = `engineering-${id}`;
  return (
    <div className="engineering-story">
      <figure aria-labelledby={caption}>
        <figcaption id={caption}>
          <h4>How it fits together</h4>
          <p>{story.summary}</p>
        </figcaption>
        <ol className="engineering-flow" role="list" aria-label="System flow">
          {story.steps.map((step, index) => (
            <li key={step.title}>
              <span className="engineering-step" aria-hidden="true">
                <SystemSketch kind={step.art} />
                <span>0{index + 1}</span>
              </span>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
              {index < story.steps.length - 1 && (
                <svg className="engineering-arrow" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M3 12h17m-6-6 6 6-6 6" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </figure>
      <div className="engineering-notes">
        <section>
          <h4>{story.failure.title}</h4>
          <p>{story.failure.detail}</p>
        </section>
        <section>
          <h4>The tradeoff</h4>
          <p>{story.tradeoff}</p>
        </section>
      </div>
    </div>
  );
}
