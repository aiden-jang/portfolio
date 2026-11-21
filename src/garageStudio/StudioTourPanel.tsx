import { finishStudioTour, useTour, visitTourStop } from './studioTour';

const stops = [
  {
    title: 'F40 rear louvers',
    description: 'Drag across the slats to see the engine come into view.',
  },
  {
    title: 'Miata pop-up headlights',
    description: 'Watch the raised lamps change the light on the concrete.',
  },
  {
    title: 'Porsche silhouettes',
    description: 'Compare the two profiles with their front axles aligned.',
  },
  {
    title: 'The reflection pass',
    description: 'See the reflected scene the renderer uses beneath the car.',
  },
] as const;

export function StudioTour({ waiting }: { waiting: boolean }) {
  const index = useTour((state) => state.index);
  if (index === null) return null;
  const stop = stops[index]!;
  return (
    <section className="creative-studio-tour" aria-label="Guided Studio visit">
      <div aria-live="polite">
        <p>
          {index + 1} of {stops.length}
        </p>
        <strong>{stop.title}</strong>
        <p>{stop.description}</p>
      </div>
      <div className="creative-tour-actions">
        <button
          type="button"
          disabled={index === 0 || waiting}
          onClick={() => visitTourStop(index - 1)}
        >
          Previous
        </button>
        {index < stops.length - 1 && (
          <button type="button" disabled={waiting} onClick={() => visitTourStop(index + 1)}>
            Next stop
          </button>
        )}
        <button type="button" onClick={finishStudioTour}>
          {index === stops.length - 1 ? 'Return to my view' : 'End tour'}
        </button>
      </div>
    </section>
  );
}
