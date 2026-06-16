import { useState } from 'react';
import { EYEBROW, H2, P_LI, PANEL_BASE, Section } from './shared';
import { Credits } from './Credits';

const EMAIL = 'aidenwsj@gmail.com';

const SOCIAL_LINKS: { label: string; url: string }[] = [
  { label: 'github.com/aiden-jang', url: 'https://github.com/aiden-jang' },
  { label: 'linkedin.com/in/aidenjang', url: 'https://linkedin.com/in/aidenjang' },
];

const LINK_CLASS =
  'text-[var(--color-fg)] no-underline border-b border-[var(--color-neon)] hover:text-[var(--color-neon)]';

export function ContactSection() {
  return (
    <Section id="sec-contact" side="center">
      <div className={PANEL_BASE}>
        <span className={EYEBROW}>04 / CONTACT</span>
        <h2 className={H2}>Let&apos;s talk.</h2>
        <ul className={`list-none p-0 mt-4 ${P_LI}`}>
          <EmailRow />
          {SOCIAL_LINKS.map((l) => (
            <li key={l.url} className="py-1.5">
              <a href={l.url} target="_blank" rel="noopener" className={LINK_CLASS}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
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
            pointer-events-auto whitespace-nowrap
            mt-2 block mx-auto
            md:mt-0 md:absolute md:left-full md:ml-3 md:top-1/2 md:-translate-y-1/2
            font-[var(--font-mono)] text-[0.62rem] tracking-[0.24em] uppercase
            px-2.5 py-1 rounded-full border transition-colors
            ${copied
              ? 'border-[var(--color-neon)] text-[var(--color-neon)]'
              : 'border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]'}
          `}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </span>
    </li>
  );
}
