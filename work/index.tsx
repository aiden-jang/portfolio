import { useLayoutEffect } from 'react';
import { DinnerTable } from '../src/ui/showcase/DinnerTable';
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
import './index.css';
import './exhibition.css';

const entries = [
  ['everythingisfine', 'meanwhile.', 'Earth’s live signals', 'atlas-globe-desktop.webp'],
  ['iodine', 'iodine', 'Recovery for agent edits', 'scenes/iodine-inside-desktop.webp'],
  ['bloomnote', 'bloomnote', 'A note grown into a garden', 'bloomnote-garden.jpg'],
  ['iguess', 'iguess', 'A drawing game with a live guess', 'iguess.jpg'],
  ['mrrp', 'mrrp', 'A little room for Bean', 'scenes/mrrp-room-art-desktop.webp'],
  ['wherever', 'wherever', 'Choose dinner', 'scenes/wherever-pizza.jpg'],
  ['owewell', 'owewell', 'Split the bill', 'scenes/owewell-result-desktop.webp'],
  ['worth', 'worth', 'Save a favorite', 'worth-verdict.webp'],
  ['platform', 'Shared sign-in', 'One account for the apps', 'platform-hub.webp'],
];
const cases: Record<string, string> = {
  everythingisfine: '/cases/meanwhile/',
  iodine: '/cases/iodine/',
};

function demoHref(id: string) {
  if (['wherever', 'owewell', 'worth'].includes(id)) return '/work/?story=dinner#project-' + id;
  if (id === 'platform') return undefined;
  return '/#project-' + id;
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
        <a
          className="index-migration"
          href="/#work/monolith-django-rest-react-rewrite"
          data-work-row="migration-proof"
          onClick={followWorkRow}
        >
          <strong>30,000+</strong>
          <span>
            Active newsletters on the publisher platform we migrated from PHP to Django REST.
          </span>
          <span aria-hidden="true">↗</span>
        </a>
        <section className="index-history" id="experience">
          <ExperienceHistory onOpen={(item, row) => openWorkRow(row, '/#work/' + workId(item))} />
        </section>
        <section className="index-projects" aria-labelledby="projects-heading">
          <h2 id="projects-heading">Projects</h2>
          <div className="index-catalog">
            {entries.map(([id, title, description, image]) => {
              const demo = demoHref(id);
              const reader = cases[id] ?? '/#work/' + id;
              const label = cases[id] ? 'Case study' : 'Project notes';
              const asset = '/projects/' + image;
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
