import { followRelatedStory, followWorkIndex, indexHref, workOrigin } from '../workIndexNavigation';
import { useEffect, useState } from 'react';
import { WORK_ITEMS, workId } from '../../data/workItems';
import { copyText } from '../../browserSharing';
import { WorkStory } from '../WorkStory';
import { WorkStoryEnding } from '../WorkStoryEnding';
import { IodineSession, type IodinePhase } from '../showcase/iodine-session';
import { BatchingCaseOpening, IodineCaseOpening, QuakeCaseOpening } from './CaseOpening';
import { ScopedApprovals } from '../showcase/ScopedApprovals';
import { ControlIcon } from '../ControlIcon';
import { ResumeButton } from '../ResumeButton';
import { evidenceHref, portfolioPath, storyHref, type StoryId } from './storyRoutes';
import './creative.css';
import './case-continuity.css';
import type { EvidenceFrame } from './evidenceNavigation';

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
    title: 'Ad Slot Details went from about a minute to two seconds.',
    role: 'For a large ad slot, the browser made around 120 requests before the page was ready. At Zeta Global, I changed the API to return the linked line items in one response.',
    next: 'monolith-django-rest-react-rewrite',
    nextLabel: 'How two engineers replaced a live publisher backend',
    nextDetail:
      'See how I took ownership across the database, API, and interface in a six-month rewrite.',
  },
} as const;

export function StoryPage({
  id,
  frame,
  returnToPortfolio,
  openRelatedWork,
}: {
  id: StoryId;
  frame?: EvidenceFrame;
  returnToPortfolio?: () => void;
  openRelatedWork?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const item = WORK_ITEMS.find((candidate) => workId(candidate) === id)!;
  const story = stories[id];
  const fromIndex = Boolean(workOrigin());
  const root = portfolioPath(location.pathname);
  const [phase, setPhase] = useState<IodinePhase>(() =>
    new URLSearchParams(location.search).get('edit') === 'restored' ? 'restored' : 'edited',
  );
  const [agency, setAgency] = useState<'USGS' | 'EMSC'>(() =>
    new URLSearchParams(location.search).get('agency') === 'EMSC' ? 'EMSC' : 'USGS',
  );
  const [share, setShare] = useState<'idle' | 'copied' | 'failed'>('idle');
  const evidenceState = {
    edit: id === 'iodine' ? phase : undefined,
    agency: id === 'everythingisfine' ? agency : undefined,
  };
  const shareUrl = new URL(evidenceHref(id, evidenceState), location.origin).href;
  const browserUrl = root === location.pathname ? storyHref(id, evidenceState) : shareUrl;
  useEffect(() => {
    document.title = story.title + ' | Aiden Jang';
  }, [story.title]);
  useEffect(() => {
    history.replaceState(history.state, '', browserUrl);
    setShare('idle');
  }, [browserUrl, shareUrl]);
  const relatedWork =
    story.next === 'publisher-account-migrations' ||
    story.next === 'monolith-django-rest-react-rewrite';
  const next = relatedWork ? root + '#work/' + story.next : evidenceHref(story.next, undefined);
  const section =
    id === 'ad-slot-details-120-1-api-call'
      ? '#sec-experience'
      : id === 'iodine'
        ? '#project-iodine'
        : '#project-everythingisfine';
  const returnClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      !returnToPortfolio ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    returnToPortfolio();
  };
  return (
    <IodineSession.Provider value={{ phase, setPhase }}>
      <div className="creative-case" data-case={id} data-opening="evidence">
        <header className="creative-case-nav">
          <a
            href={fromIndex ? indexHref() : root + section}
            onClick={fromIndex ? followWorkIndex : returnClick}
          >
            <ControlIcon name="arrow" /> {fromIndex ? 'Work index' : 'Portfolio'}
          </a>
          <span className="case-opening-label">{story.label}</span>
          <ResumeButton />
        </header>
        <main className="story-scroll-area creative-case-content">
          <header
            className={
              id === 'iodine'
                ? 'creative-case-heading iodine-case-heading'
                : 'creative-case-heading'
            }
          >
            <h1 tabIndex={-1}>{story.title}</h1>
            {id !== 'iodine' && <p>{story.role}</p>}
          </header>
          {id === 'everythingisfine' ? (
            <QuakeCaseOpening agency={agency} onSelect={setAgency} frame={frame} />
          ) : id === 'iodine' ? (
            <IodineCaseOpening role={story.role} />
          ) : (
            <BatchingCaseOpening />
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
            <a
              href={next}
              onClick={(event) => {
                if (id === 'ad-slot-details-120-1-api-call') openRelatedWork?.(event);
                followRelatedStory(event);
              }}
            >
              {story.nextLabel} <ControlIcon name="arrow" />
            </a>
          </aside>
          <footer className="creative-case-footer">
            <a href={root + '#sec-contact'}>Contact Aiden</a>
            <a href={indexHref()} onClick={followWorkIndex}>
              Work index
            </a>
            <a href={root + section} onClick={returnClick}>
              Back to the portfolio
            </a>
          </footer>
        </main>
      </div>
    </IodineSession.Provider>
  );
}
