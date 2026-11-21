import { ControlIcon } from '../ControlIcon';
import { useId, useRef, useState } from 'react';
import { ExpandIcon } from '../ExpandIcon';
import { ScreenshotViewer } from '../ScreenshotViewer';
import './owewell-preview.css';

export function OwewellPreview() {
  const [payer, setPayer] = useState<'you' | 'alex'>('you');
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const radioName = useId();

  return (
    <>
      <div className="owewell-demo">
        <div className="owewell-demo-inner">
          <header className="owewell-demo-header">
            <div>
              <span className="owewell-demo-meal">
                Dinner <strong>$48.00</strong>
              </span>
              <span className="owewell-demo-muted">Sample split · Equal shares</span>
            </div>
            <button
              ref={trigger}
              type="button"
              className="owewell-demo-inspect"
              aria-label="Inspect screenshot: owewell"
              title="View owewell screenshot"
              onClick={() => setOpen(true)}
            >
              <ExpandIcon />
            </button>
          </header>
          <fieldset className="owewell-demo-payer">
            <legend>Who paid?</legend>
            <div className="owewell-demo-choices">
              <label>
                <input
                  type="radio"
                  name={radioName}
                  checked={payer === 'you'}
                  onChange={() => setPayer('you')}
                />
                You
              </label>
              <label>
                <input
                  type="radio"
                  name={radioName}
                  checked={payer === 'alex'}
                  onChange={() => setPayer('alex')}
                />
                Alex
              </label>
            </div>
          </fieldset>
          <div
            className="owewell-demo-transfer"
            role="status"
            aria-atomic="true"
            data-payer={payer}
          >
            <span className="owewell-result-detail">
              <span className="owewell-direction" aria-hidden="true">
                <ControlIcon name="arrow" />
              </span>
              {payer === 'you' ? 'Alex pays you' : 'You pay Alex'}
            </span>{' '}
            <strong>$24.00</strong>
          </div>
        </div>
      </div>
      {open && (
        <ScreenshotViewer
          image={payer === 'alex' ? '/projects/owewell-alex.webp' : '/projects/owewell-you.webp'}
          name="owewell"
          caption={
            payer === 'alex'
              ? 'Alex paid the $48 bill. Maya owes Alex $24.'
              : 'Maya paid the $48 bill. Alex owes Maya $24.'
          }
          returnFocus={trigger.current}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
