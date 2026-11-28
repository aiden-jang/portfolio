import { useState } from 'react';
import './career-evidence.css';

const testSteps = [
  {
    label: 'Plan',
    detail: 'Check that a publisher can save changes.',
    code: 'Expect a visible confirmation after saving.',
  },
  {
    label: 'Generate',
    detail: 'Turn the scenario into a running test.',
    code: 'getByRole("button", { name: "Save" }).click()',
  },
  {
    label: 'Repair',
    detail:
      'The control is now labeled “Save changes.” Update the locator and retain the original check.',
    code: 'getByRole("button", { name: "Save changes" }).click()',
  },
] as const;

function PlaywrightSequence() {
  const [step, setStep] = useState(0);
  const active = testSteps[step];
  return (
    <figure className="career-evidence">
      <figcaption>
        <strong>One test through a UI change</strong>
        <span>Illustrative example</span>
      </figcaption>
      <div role="group" aria-label="Choose a test stage" className="career-evidence-choices">
        {testSteps.map(({ label }, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={step === index}
            onClick={() => setStep(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="career-evidence-code" aria-live="polite">
        <strong>{active.detail}</strong>
        <code>{active.code}</code>
      </div>
    </figure>
  );
}

export function CareerEvidence({ id }: { id: string }) {
  if (id === 'monolith-django-rest-react-rewrite') {
    return (
      <p className="work-modal-summary">Platform scale · 30,000+ active publisher newsletters</p>
    );
  }
  if (id === 'agentic-ai-playwright-framework') return <PlaywrightSequence />;
  if (id === 'sponsorships-audience-extension-blackout-periods') {
    return (
      <figure className="career-evidence">
        <figcaption>
          <strong>One sponsorship, more than one newsletter</strong>
          <span>Illustrative relationships</span>
        </figcaption>
        <div className="career-evidence-relation">
          <div>
            <strong>Line item A</strong>
            <span>Newsletter one · Newsletter two</span>
          </div>
          <div>
            <strong>Line item B</strong>
            <span>Newsletter two</span>
          </div>
        </div>
        <p>
          Newsletter two can be associated with either line item. Each line item can reach multiple
          newsletters.
        </p>
      </figure>
    );
  }
  return null;
}
