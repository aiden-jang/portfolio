import { useState, type ReactNode } from 'react';
import { EYEBROW, H2, P_LI, PANEL_BASE, Section } from './shared';
import { Credits } from './Credits';

const EMAIL = 'aidenwsj@gmail.com';

const LINK_CLASS =
  'inline-block py-1 text-[var(--color-fg)] no-underline border-b border-[var(--color-neon)] hover:text-[var(--color-neon)]';

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3v6.3zM5.3 7.4a2 2 0 1 1 0-4.1 2 2 0 0 1 0 4.1zM7.1 20.4H3.6V9h3.5v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" />
  </svg>
);

const SOCIAL_LINKS: { label: string; url: string; icon: () => ReactNode }[] = [
  { label: 'GitHub', url: 'https://github.com/aiden-jang', icon: GitHubIcon },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/aidenjang', icon: LinkedInIcon },
];

const EMAIL_STARTERS = [
  { label: 'a product idea', subject: 'A product idea' },
  { label: 'a project', subject: 'A project' },
  { label: 'your work', subject: 'Your work' },
];

export function ContactSection() {
  return (
    <Section id="sec-contact" side="center">
      <div className={PANEL_BASE}>
        <span className={EYEBROW}>04 / CONTACT</span>
        <h2 className={H2}>Got an idea?</h2>
        <p className={`${P_LI} mx-auto mt-3 max-w-[39ch]`}>
          I like talking about product ideas, real-time systems, and weird little side projects.
          Email is the best way to reach me.
        </p>
        <ul className={`list-none p-0 mt-4 ${P_LI}`}>
          <EmailRow />
        </ul>
        <div className="mt-3 pointer-events-auto">
          <p className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.16em] uppercase text-[var(--color-muted)]">
            Want a head start?
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {EMAIL_STARTERS.map(({ label, subject }) => (
              <a
                key={subject}
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`}
                className="rounded-full border border-white/[0.1] px-2.5 py-1.5 font-[var(--font-mono)] text-[0.57rem] tracking-[0.1em] text-[var(--color-muted)] no-underline transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 pointer-events-auto">
          {SOCIAL_LINKS.map(({ label, url, icon: Icon }) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener"
              aria-label={label}
              title={label}
              className="
                inline-flex items-center justify-center w-11 h-11 rounded-full
                border border-[var(--color-line)] text-[var(--color-muted)]
                transition-colors hover:text-[var(--color-neon)] hover:border-[var(--color-neon)]
              "
            >
              <Icon />
            </a>
          ))}
        </div>
        <Credits />
      </div>
    </Section>
  );
}

/** Mailto link plus a copy-to-clipboard pill. Most visitors won't have Mail.app
 *  configured; the copy button is the one-click path, mailto is the fallback. */
function EmailRow() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked (insecure context, permissions); mailto still works */
    }
  };

  return (
    <li className="py-1.5 text-center">
      {/* inline-block sizes to the email alone, so text-center centers the
       *  address itself — matching the links below. On desktop the copy pill
       *  is taken out of flow (absolute, to the right) so it can't pull the
       *  email off-center. On mobile that absolute pill would shoot past the
       *  viewport edge and create a sideways scroll, so there it sits centered
       *  on its own line below the address instead. */}
      <span className="relative inline-block">
        <a href={`mailto:${EMAIL}`} className={LINK_CLASS}>
          {EMAIL}
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Email address copied' : 'Copy email address'}
          className={`
            pointer-events-auto whitespace-nowrap cursor-pointer
            mt-2 flex w-fit mx-auto items-center justify-center min-h-[40px]
            md:mt-0 md:min-h-0 md:w-auto md:block md:absolute md:left-full md:ml-3 md:top-1/2 md:-translate-y-1/2
            font-[var(--font-mono)] text-[0.62rem] tracking-[0.24em] uppercase
            px-3.5 py-2 md:px-2.5 md:py-1 rounded-full border transition-colors
            ${
              copied
                ? 'border-[var(--color-neon)] text-[var(--color-neon)]'
                : 'border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]'
            }
          `}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </span>
    </li>
  );
}
