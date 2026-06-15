import { CTA_BUTTON, EYEBROW, H2, P_LI, PANEL_BASE, Section, UL_BASE } from './shared';

const ROLES = [
  'Software Engineer · Zeta Global · 2024–present',
  'Software Engineer · LiveIntent · 2023–2024',
  'Associate Software Engineer · LiveIntent · 2022–2023',
];

export function ExperienceSection() {
  return (
    <Section id="sec-experience" side="right">
      <div className={PANEL_BASE}>
        <span className={EYEBROW}>03 / EXPERIENCE</span>
        <h2 className={H2}>Experience</h2>
        <ul className={`${UL_BASE} ${P_LI}`}>
          {ROLES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <a href="/resume.pdf" className={CTA_BUTTON}>
          Download PDF →
        </a>
      </div>
    </Section>
  );
}
