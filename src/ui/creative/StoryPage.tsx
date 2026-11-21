import { kamchatkaExample } from '../../data/kamchatkaExample';
import { useEffect, useState } from 'react';
import { WORK_ITEMS, workId } from '../../data/workItems';
import { copyText } from '../../browserSharing';
import { WorkStoryOpening } from '../WorkStoryOpening';
import { WorkStory } from '../WorkStory';
import { WorkStoryEnding } from '../WorkStoryEnding';
import { IodineSession, type IodinePhase } from '../showcase/iodine-session';
import { DepthSection } from '../showcase/DepthSection';
import { EarthquakeGlobeStill } from '../showcase/EarthquakeEvidence';
import { ScopedApprovals } from '../showcase/ScopedApprovals';
import { ControlIcon } from '../ControlIcon';
import { ResumeButton } from '../ResumeButton';
import { storyHref, type StoryId } from './storyRoutes';
import './creative.css';

const stories = {
  everythingisfine: {
    label: 'meanwhile.',
    title: 'One quake. Two depths.',
    role: 'I built the event matching that keeps both agencies’ measurements attached to the same quake.',
    next: 'ad-slot-details-120-1-api-call',
    nextLabel: 'See the batching decision',
    nextDetail:
      'The batching case also brings related records together while keeping the data the interface needs.',
  },
  iodine: {
    label: 'iodine',
    title: 'An edit you can take back.',
    role: 'I contributed scoped terminal approvals, edit recovery and clickable file paths to the open-source IDE.',
    next: 'publisher-account-migrations',
    nextLabel: 'Read about transactional publisher migrations',
    nextDetail:
      'At LiveIntent, the same concern with recovery shaped how I moved publisher data between accounts.',
  },
  'ad-slot-details-120-1-api-call': {
    label: 'Ad Slot Details',
    title: '120 API calls became one.',
    role: 'I rewrote the fetch at Zeta Global to return the linked line items as one response.',
    next: 'everythingisfine',
    nextLabel: 'See how I matched earthquake reports',
    nextDetail:
      'In meanwhile., I had to decide which records belong together while retaining both sources’ measurements.',
  },
} as const;

export function StoryPage({ id }: { id: StoryId }) {
  const item = WORK_ITEMS.find((candidate) => workId(candidate) === id)!;
  const story = stories[id];
  const root = location.pathname;
  const [phase, setPhase] = useState<IodinePhase>(() =>
    new URLSearchParams(location.search).get('edit') === 'restored' ? 'restored' : 'edited',
  );
  const [agency, setAgency] = useState<'USGS' | 'EMSC'>(() =>
    new URLSearchParams(location.search).get('agency') === 'EMSC' ? 'EMSC' : 'USGS',
  );
  const [share, setShare] = useState<'idle' | 'copied' | 'failed'>('idle');
  const shareUrl = new URL(
    storyHref(id, {
      edit: id === 'iodine' && phase === 'restored' ? 'restored' : undefined,
      agency: id === 'everythingisfine' ? agency : undefined,
    }),
    location.origin,
  ).href;
  useEffect(() => {
    document.title = story.label + ' | Aiden Jang';
  }, [story.label]);
  useEffect(() => {
    history.replaceState(history.state, '', shareUrl);
    setShare('idle');
  }, [shareUrl]);
  const next =
    story.next === 'publisher-account-migrations'
      ? root + '#work/' + story.next
      : storyHref(story.next);
  const section =
    id === 'ad-slot-details-120-1-api-call'
      ? '#sec-experience'
      : id === 'iodine'
        ? '#project-iodine'
        : '#project-everythingisfine';
  return (
    <IodineSession.Provider value={{ phase, setPhase }}>
      <div className="creative-case" data-case={id}>
        <header className="creative-case-nav">
          <a href={root + section}>
            <ControlIcon name="arrow" /> Portfolio
          </a>
          <ResumeButton />
        </header>
        <main className="story-scroll-area creative-case-content">
          <header className="creative-case-heading">
            <p>{story.label}</p>
            <h1>{story.title}</h1>
            <p>{story.role}</p>
          </header>
          {id === 'everythingisfine' ? (
            <div className="creative-quake-case">
              <figure className="creative-case-globe">
                <EarthquakeGlobeStill />
                <figcaption>Off the east coast of Kamchatka · 17 Aug 2026</figcaption>
              </figure>
              <div>
                <DepthSection selected={agency} onSelect={setAgency} />
                <p className="preview-inline-source">
                  <a
                    href={kamchatkaExample.report}
                    target="_blank"
                    rel="noopener"
                    aria-describedby="external-link-hint"
                  >
                    USGS event record
                  </a>
                  <a
                    href="https://github.com/aiden-jang/meanwhile/blob/main/src/sources/fixtures/one-quake-both-feeds.json"
                    target="_blank"
                    rel="noopener"
                    aria-describedby="external-link-hint"
                  >
                    Matching fixture
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <WorkStoryOpening item={item} />
          )}
          <div className="creative-case-share">
            <button type="button" onClick={() => void copyText(shareUrl).then(setShare)}>
              {share === 'copied' ? 'Link copied' : 'Copy evidence link'}
            </button>
            {share === 'failed' && (
              <input
                aria-label="Evidence link"
                value={shareUrl}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            )}
          </div>
          {id === 'iodine' && <ScopedApprovals />}
          <WorkStory item={item} />
          <WorkStoryEnding item={item} />
          <aside className="creative-case-next">
            <p>{story.nextDetail}</p>
            <a href={next}>
              {story.nextLabel} <ControlIcon name="arrow" />
            </a>
          </aside>
          <footer className="creative-case-footer">
            <a href={root + '#sec-contact'}>Contact Aiden</a>
            <a href={root + section}>Back to the portfolio</a>
          </footer>
        </main>
      </div>
    </IodineSession.Provider>
  );
}
