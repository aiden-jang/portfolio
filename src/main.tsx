import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoryPage } from './ui/creative/StoryPage';
import { storyAtLocation } from './ui/creative/storyRoutes';
import './ui/composition-polish.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

const story = storyAtLocation(location);

createRoot(root).render(<StrictMode>{story ? <StoryPage id={story} /> : <App />}</StrictMode>);
