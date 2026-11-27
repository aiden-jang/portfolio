import { acceptWorkOrigin } from './ui/workIndexNavigation';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EvidenceRoute } from './ui/creative/EvidenceRoute';
import { StoryPage } from './ui/creative/StoryPage';
import { storyAtLocation } from './ui/creative/storyRoutes';
import './ui/composition-polish.css';
import './ui/portfolio-sequence.css';
import './ui/shorter-timing.css';
import './ui/portfolio-finish.css';
import './ui/scroll-choreography.css';
import './ui/featured-proof.css';
import './ui/showcase/work-sequence.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

acceptWorkOrigin();
const story = storyAtLocation(location);

createRoot(root).render(
  <StrictMode>{story ? <StoryPage id={story} /> : <EvidenceRoute />}</StrictMode>,
);
