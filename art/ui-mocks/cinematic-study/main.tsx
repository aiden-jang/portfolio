import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../../src/App';
import { THEMES } from '../../../src/config';
import { CinemaDirector } from './CinemaDirector';
import { ContributionStage } from './ContributionStage';
import './cinema.css';

THEMES.dusk.key.intensity = 0.55;
THEMES.dusk.fill.intensity = 0.95;
THEMES.dusk.rim.intensity = 1.02;
THEMES.dusk.reflectorColor = 0x41414b;
THEMES.dusk.bloomStrength = 0.085;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <CinemaDirector />
    <ContributionStage />
  </StrictMode>,
);
