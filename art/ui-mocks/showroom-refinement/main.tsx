import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../../src/App';
import './showroom.css';
import './projects.css';
import './reading.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
