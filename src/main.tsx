import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoryPage } from './ui/creative/StoryPage';
import { storyIds } from './ui/creative/storyRoutes';
import './ui/composition-polish.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

const story = storyIds.find((id) => id === new URLSearchParams(location.search).get('story'));

createRoot(root).render(<StrictMode>{story ? <StoryPage id={story} /> : <App />}</StrictMode>);
