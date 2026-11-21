import { WORK_ITEMS } from '../../data/workItems';
import type { WorkDetail } from '../../types';
import { Section } from './shared';
import './about.css';
import { AboutFraming } from './AboutFraming';
import { AboutReel } from './AboutReel';

const wherever = WORK_ITEMS.find((item) => item.mark === 'wherever');
const bloomnote = WORK_ITEMS.find((item) => item.mark === 'bloomnote');

export function AboutSection({
  onOpen,
}: {
  onOpen: (item: WorkDetail, trigger: HTMLElement) => void;
}) {
  return (
    <Section id="sec-about" side="left" desktopVertical="top" mobileVertical="top">
      <div className="about-copy pointer-events-auto">
        <h2>About</h2>
        <AboutReel />
        <div className="about-grid">
          <AboutFraming />
          <div className="about-profile">
            <div className="about-story">
              <p className="about-lead">Most of my side projects start with something ordinary.</p>
              <p className="about-body">
                Picking dinner with friends became{' '}
                {wherever ? (
                  <button
                    type="button"
                    className="about-story-link"
                    aria-label="Read the wherever case study"
                    onClick={(event) => onOpen(wherever, event.currentTarget)}
                  >
                    wherever
                  </button>
                ) : (
                  <strong>wherever</strong>
                )}
                . A note for someone became{' '}
                {bloomnote ? (
                  <button
                    type="button"
                    className="about-story-link"
                    aria-label="Read the bloomnote case study"
                    onClick={(event) => onOpen(bloomnote, event.currentTarget)}
                  >
                    bloomnote
                  </button>
                ) : (
                  <strong>bloomnote</strong>
                )}
                . Then there’s <strong>mrrp</strong>, a room for two and a pixel cat.
              </p>
            </div>
            <dl className="about-details">
              <div>
                <dt>Background</dt>
                <dd>Computer Engineering at Rutgers</dd>
              </div>
              <div>
                <dt>Open source</dt>
                <dd>
                  <a
                    href="https://github.com/hyunwookshin/iodine/commits/main/?author=aiden-jang"
                    target="_blank"
                    aria-describedby="external-link-hint"
                    rel="noopener noreferrer"
                    className="about-contribution-link"
                  >
                    iodine <span aria-hidden="true">↗</span>
                  </a>
                  <p>
                    Scoped terminal approvals, agent edit recovery, and clickable file paths in
                    agent replies.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Section>
  );
}
