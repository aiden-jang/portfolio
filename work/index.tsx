import { useLayoutEffect } from 'react';
import { DinnerTable } from '../src/ui/showcase/DinnerTable';
import { WorthCharacter } from '../src/ui/showcase/DinnerRating';
import { createRoot } from 'react-dom/client';
import { workId } from '../src/data/workItems';
import { AboutReel } from '../src/ui/sections/AboutReel';
import { ExperienceHistory } from '../src/ui/sections/Experience';
import {
  acceptWorkOrigin,
  followWorkIndex,
  followWorkRow,
  indexHref,
  openWorkRow,
  useWorkIndexReturn,
} from '../src/ui/workIndexNavigation';
import rearFinishImage from '../wing-art/desktop-rear/12.jpg';
import './index.css';
import './exhibition.css';

const entries = [
  ['everythingisfine', 'meanwhile.', 'Earth’s live signals', 'atlas-globe-desktop.webp'],
  ['iodine', 'iodine', 'Recovery for agent edits', 'scenes/iodine-inside-desktop.webp'],
  ['batch', '120 calls → 1', 'From a minute to two seconds', 'batch-share.png'],
  ['bloomnote', 'bloomnote', 'A note grown into a garden', 'bloomnote-garden.jpg'],
  ['iguess', 'iguess', 'A drawing game with a live guess', 'iguess.jpg'],
  ['mrrp', 'mrrp', 'A little room for Bean', 'scenes/mrrp-room-art-desktop.webp'],
  ['wherever', 'wherever', 'Choose dinner', 'scenes/wherever-pizza.jpg'],
  ['owewell', 'owewell', 'Split the bill', 'scenes/owewell-result-desktop.webp'],
  ['worth', 'worth', 'Save a favorite', 'worth-verdict.webp'],
  ['platform', 'Shared sign-in', 'One account for the apps', 'platform-hub.webp'],
  ['f40', 'F40 study', 'Clay to paint', rearFinishImage],
];
const cases: Record<string, string> = {
  everythingisfine: '/cases/meanwhile/',
  iodine: '/cases/iodine/',
  batch: '/cases/request-batching/',
};

function demoHref(id: string) {
  if (['wherever', 'owewell', 'worth'].includes(id)) return '/work/?story=dinner#project-' + id;
  if (id === 'platform') return undefined;
  if (id === 'batch') return '/#batching-study';
  if (id === 'f40') return '/#f40-study';
  return '/#project-' + id;
}
const dinnerUrl = '/work/?story=dinner';
const photo = '/projects/scenes/wherever-pizza.jpg';

function DinnerFeature() {
  return (
    <a
      className="index-dinner-feature"
      href={dinnerUrl}
      onClick={followWorkRow}
      data-work-row="dinner"
      aria-label="Play Dinner for two, from wherever through owewell to worth"
    >
      <div className="index-dinner-intro">
        <p className="index-dinner-apps">
          wherever <span>·</span> owewell <span>·</span> worth
        </p>
        <h2>
          Dinner
          <br /> for two.
        </h2>
        <p className="index-dinner-caption">Pick a place, split the bill, keep a favorite.</p>
        <span className="index-dinner-play">
          Choose dinner <b aria-hidden="true">→</b>
        </span>
      </div>
      <div className="index-dinner-art" aria-hidden="true">
        <div className="index-dinner-photo">
          <img src={photo} alt="" />
        </div>
        <div className="index-dinner-check">
          <span>
            Neighborhood
            <br />
            Pizza Kitchen
          </span>
          <div>
            <small>Dinner for two</small>
            <strong>$48.00</strong>
          </div>
        </div>
        <div className="index-dinner-stamp">
          <WorthCharacter />
        </div>
      </div>
    </a>
  );
}

function DinnerExhibit() {
  useLayoutEffect(() => {
    acceptWorkOrigin();
    if (location.hash === '#project-owewell' || location.hash === '#project-worth') {
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, []);
  function read(id: string, trigger: HTMLElement) {
    trigger.dataset.workRow = 'dinner';
    openWorkRow(trigger, '/#work/' + id);
  }
  return (
    <main className="index-dinner-story">
      <nav className="dinner-return" aria-label="Portfolio">
        <a href={indexHref()} onClick={followWorkIndex}>
          ← Work index
        </a>
        <a href="/#sec-contact">Contact</a>
      </nav>
      <DinnerTable
        dinner="https://wherever.aidenjang.com"
        bill="https://owewell.aidenjang.com"
        worth="https://worth.aidenjang.com"
        onReadDinner={(el) => read('wherever', el)}
        onReadBill={(el) => read('owewell', el)}
        onReadWorth={(el) => read('worth', el)}
      />
    </main>
  );
}

export function WorkIndex() {
  useWorkIndexReturn();
  return (
    <div className="index-page">
      <header className="index-nav">
        <a href="/">AJ / portfolio</a>
        <nav aria-label="Portfolio">
          <a href="#experience">Experience</a>
          <a href="/?garage=studio">Garage</a>
          <a href="/#sec-contact">Contact</a>
        </nav>
      </header>
      <main>
        <h1>Work index</h1>
        <DinnerFeature />
        <section className="index-projects" aria-labelledby="projects-heading">
          <h2 id="projects-heading">Projects</h2>
          <div className="index-catalog">
            {entries.map(([id, title, description, image]) => {
              const demo = demoHref(id);
              const reader = cases[id] ?? (id === 'f40' ? demo! : '/#work/' + id);
              const label = cases[id] ? 'Case study' : id === 'f40' ? 'Study' : 'Project notes';
              const asset = id === 'f40' ? image : '/projects/' + image;
              return (
                <article className={'index-project index-project-' + id} key={id}>
                  <a
                    className="index-project-cover"
                    href={demo ?? reader}
                    onClick={followWorkRow}
                    data-work-row={'cover-' + id}
                    aria-label={title + ' — ' + description}
                  >
                    <img src={asset} alt="" loading="lazy" width="180" height="126" />
                  </a>
                  <div>
                    <a
                      className="index-project-name"
                      href={reader}
                      data-work-row={id}
                      onClick={followWorkRow}
                      aria-label={title + ' — ' + label}
                    >
                      {title}
                    </a>
                    <p>{description}</p>
                  </div>
                  <div className="index-project-links">
                    {demo && demo !== reader && (
                      <a
                        href={demo}
                        data-work-row={'demo-' + id}
                        onClick={followWorkRow}
                        aria-label={title + ' demo: ' + description}
                      >
                        Try <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    <a
                      href={reader}
                      data-work-row={'notes-' + id}
                      onClick={followWorkRow}
                      aria-label={label + ' for ' + title}
                    >
                      {label}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="index-history" id="experience">
          <ExperienceHistory onOpen={(item, row) => openWorkRow(row, '/#work/' + workId(item))} />
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
        <a href="/">Back to the Corvette →</a>
        <a href="/#sec-contact">Contact →</a>
      </footer>
    </div>
  );
}
createRoot(document.getElementById('work-root')!).render(
  new URLSearchParams(location.search).get('story') === 'dinner' ? (
    <DinnerExhibit />
  ) : (
    <WorkIndex />
  ),
);
