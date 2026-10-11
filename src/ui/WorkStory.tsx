import type { WorkDetail } from '../types';

export function WorkStory({ item }: { item: WorkDetail }) {
  return (
    <div className="work-story">
      <section>
        <h4>{item.mark ? 'The product' : 'The work'}</h4>
        <p>{item.body[0]}</p>
      </section>
      {item.principle && (
        <section>
          <h4>The decision</h4>
          <p>{item.principle}</p>
        </section>
      )}
      {item.body.length > 1 && (
        <details>
          <summary>Engineering details</summary>
          <div>
            {item.body.slice(1).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
