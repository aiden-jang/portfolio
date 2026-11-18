import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../../src/App';
import { CinemaDirector } from './CinemaDirector';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <CinemaDirector />
  </StrictMode>,
);
