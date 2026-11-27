import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WORK_ITEMS, workId } from '../src/data/workItems';
import { AboutReel } from '../src/ui/sections/AboutReel';
import { ExperienceHistory } from '../src/ui/sections/Experience';
import rearFinishImage from '../wing-art/desktop-rear/12.jpg';
import './index.css';

const entries = [
  ['everythingisfine', 'meanwhile.', 'The living globe', 'atlas-globe-desktop.webp'],
  ['iodine', 'Iodine', 'Undo an edit', 'scenes/iodine-inside-desktop.webp'],
  ['batch', '120 calls → 1', 'Batching requests', 'batch-share.png'],
  ['bloomnote', 'bloomnote', 'Grow a note', 'bloomnote-garden.jpg'],
  ['iguess', 'iguess', 'Draw a guess', 'iguess.jpg'],
  ['mrrp', 'mrrp', 'Meet Bean', 'scenes/mrrp-room-art-desktop.webp'],
  ['wherever', 'wherever', 'Choose dinner', 'scenes/wherever-pizza.jpg'],
  ['owewell', 'owewell', 'Split the bill', 'scenes/owewell-result-desktop.webp'],
  ['worth', 'worth', 'Save a favorite', 'worth-verdict.webp'],
  ['platform', 'platform', 'One account for the apps', 'platform-hub.webp'],
  ['f40', 'F40 study', 'Clay to paint', rearFinishImage],
];
const destinations: Record<string, string> = {
  batch: 'sec-experience',
  f40: 'sec-about',
  platform: 'work/platform',
};
export function WorkIndex() {
  const [cover, setCover] = useState(entries[0]);
  return (
    <div className="index-page">
      <header className="index-nav">
        <a href="/">AJ / portfolio</a>
        <nav aria-label="Portfolio">
          <a href="/?garage=studio">Garage</a>
          <a href="/#sec-contact">Contact</a>
        </nav>
      </header>
      <main>
        <h1>
          Work index<span>.</span>
        </h1>
        <div className="index-spread">
          <div className="index-list">
            {entries.map((entry) => {
              const [id, title, description] = entry;
              const item = WORK_ITEMS.find((item) => workId(item) === id);
              return (
                <div
                  key={id}
                  onFocus={() => setCover(entry)}
                  onPointerEnter={() => setCover(entry)}
                >
                  <a className="index-entry" href={'/#' + (destinations[id] ?? 'project-' + id)}>
                    <strong>{title}</strong>
                    <span>{description}</span>
                    <i aria-hidden="true">↗</i>
                  </a>
                  {item?.link && (
                    <a
                      className="index-external"
                      href={item.link.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.link.label}
                    >
                      {id === 'iodine' ? 'Source' : 'Open app'} ↗
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <figure className="index-cover">
            <img src={cover[0] === 'f40' ? cover[3] : '/projects/' + cover[3]} alt="" />
            <figcaption>{cover[1]}</figcaption>
          </figure>
        </div>
        <section className="index-history" id="experience">
          <ExperienceHistory
            onOpen={(item) => {
              window.location.href = '/#work/' + workId(item);
            }}
          />
        </section>
        <section className="index-about" id="about">
          <div>
            <h2>About</h2>
            <p>
              Aiden Jang
              <br />
              Software engineer in New York.
            </p>
            <a href="/Aiden_Jang_Resume.pdf">Résumé ↗</a>
          </div>
          <AboutReel />
        </section>
      </main>
      <footer>
        <a href="/">Back to the Corvette ↗</a>
        <a href="/#sec-contact">Contact ↗</a>
      </footer>
    </div>
  );
}
createRoot(document.getElementById('work-root')!).render(<WorkIndex />);
