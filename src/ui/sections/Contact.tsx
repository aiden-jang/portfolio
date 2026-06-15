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
    <li className="py-1.5 flex flex-wrap items-center gap-3">
      <a href={`mailto:${EMAIL}`} className={LINK_CLASS}>
        {EMAIL}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Email address copied' : 'Copy email address'}
        className={`
          pointer-events-auto
          font-[var(--font-mono)] text-[0.62rem] tracking-[0.24em] uppercase
          px-2.5 py-1 rounded-full border transition-colors
          ${copied
            ? 'border-[var(--color-neon)] text-[var(--color-neon)]'
            : 'border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]'}
        `}
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </li>
  );
}
