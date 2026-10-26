import { copyText } from '../../browserSharing';
import { useShareFeedback } from '../useShareFeedback';
import { H2, P_LI, PANEL_BASE, Section } from './shared';
import { Credits } from './Credits';

const EMAIL = 'me@aidenjang.com';
const SOCIAL_LINKS = [
  { label: 'GitHub', url: 'https://github.com/aiden-jang' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/aidenjang' },
];

export function ContactSection() {
  return (
    <Section id="sec-contact" side="center">
      <div className={PANEL_BASE}>
        <h2 className={H2}>Let’s talk.</h2>
        <p className={`${P_LI} mx-auto mt-3 max-w-[30ch]`}>
          Have a role, project or question in mind?
        </p>
        <EmailActions />
        <div className="contact-social-links">
          {SOCIAL_LINKS.map(({ label, url }) => (
            <a
              key={url}
              href={url}
              target="_blank"
              aria-describedby="external-link-hint"
              rel="noopener"
            >
              {label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
      <footer className="contact-footer">
        <Credits />
      </footer>
    </Section>
  );
}

function EmailActions() {
  const { result: copyState, run } = useShareFeedback(EMAIL);
  const copied = copyState === 'copied';
  const failed = copyState === 'failed';
  const copyLabel = copied
    ? 'Email address copied'
    : failed
      ? 'Copy unavailable'
      : 'Copy email address';

  return (
    <div className="contact-email">
      <div className="contact-email-actions">
        <a href={`mailto:${EMAIL}`} className="contact-email-link">
          {EMAIL} <span aria-hidden="true">↗</span>
        </a>
        <button
          type="button"
          onClick={() => run(() => copyText(EMAIL))}
          aria-label={copyLabel}
          aria-describedby="contact-copy-status"
          className="contact-copy"
          data-copied={copied || undefined}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {copied ? (
              <path d="m5 12 4 4L19 6" />
            ) : failed ? (
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v6m0 4h.01" />
              </>
            ) : (
              <>
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
              </>
            )}
          </svg>
        </button>
      </div>
      <p id="contact-copy-status" className="contact-copy-status" role="status">
        {failed
          ? 'You can select the address or open it in your email app.'
          : copied
            ? 'Email address copied.'
            : ''}
      </p>
    </div>
  );
}
import '../contact.css';
