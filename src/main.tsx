import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EvidenceRoute } from './ui/creative/EvidenceRoute';
import { StoryPage } from './ui/creative/StoryPage';
import { storyAtLocation } from './ui/creative/storyRoutes';
import './ui/composition-polish.css';
import './ui/portfolio-sequence.css';
import './ui/shorter-timing.css';
import './ui/portfolio-finish.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

const story = storyAtLocation(location);

createRoot(root).render(
  <StrictMode>{story ? <StoryPage id={story} /> : <EvidenceRoute />}</StrictMode>,
);
