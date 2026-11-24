import { selectExhibit } from '../garageExhibits/select';
import { exhibitNames, type Exhibit } from '../garageExhibits/state';
import { startStudioTour } from '../garageStudio/studioTour';
import { useGarageStudio, type Chapter } from '../garageStudio/state';
import type { Command } from './commands';

export const introStudioCommands: Command[] = [
  ...(['detail', 'light'] as const).map((chapter: Chapter, index) => ({
    id: 'studio-' + chapter,
    label: ['Mechanical details', 'Blackout'][index],
    hint: 'studio',
    keywords: 'garage walkaround rear wing lighting compare scale',
    run: () => {
      const studio = useGarageStudio.getState();
      studio.open();
      studio.select(chapter);
    },
  })),
  {
    id: 'studio-render',
    label: 'Render study',
    hint: 'studio',
    keywords: 'clay matte shadows reflection',
    run: () => {
      useGarageStudio.getState().open();
      useGarageStudio.setState({ study: 'finished' });
    },
  },
  {
    id: 'studio-tour',
    label: 'Studio tour',
    hint: 'studio',
    keywords: 'guided car exhibits',
    run: () => {
      useGarageStudio.getState().open();
      startStudioTour();
    },
  },
  ...Object.entries(exhibitNames)
    .filter(([id]) => id !== 'free')
    .map(([id, label]) => ({
      id: 'studio-exhibit-' + id,
      label,
      hint: 'exhibit',
      keywords: 'studio exhibits garage',
      run: () => {
        useGarageStudio.getState().open();
        selectExhibit(id as Exhibit);
      },
    })),
];
