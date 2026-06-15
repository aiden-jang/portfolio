import { EYEBROW, H2, P_LI, PANEL_BASE, Section } from './shared';
import { Credits } from './Credits';

const LINKS: { label: string; url: string }[] = [
  { label: 'aidenwsj@gmail.com', url: 'mailto:aidenwsj@gmail.com' },
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
          {LINKS.map((l) => (
            <li key={l.url} className="py-1.5">
              <a
                href={l.url}
                target={l.url.startsWith('http') ? '_blank' : undefined}
                rel={l.url.startsWith('http') ? 'noopener' : undefined}
                className={LINK_CLASS}
              >
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
