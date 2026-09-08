import { CARS, SECTION_IDS, type SectionId } from '../config';
import { shareCurrentScene } from '../sceneLink';
import { useAppStore } from '../store';

export type Command = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void | Promise<void>;
  closeOnRun?: boolean;
};

export const SECTION_LABELS: Record<SectionId, string> = {
  'sec-intro': 'Intro',
  'sec-experience': 'Experience',
  'sec-work': 'Projects',
  'sec-about': 'About',
  'sec-contact': 'Contact',
};

type Deps = {
  onSection: (id: SectionId) => void;
  setNotice: (text: string) => void;
};

export function buildCommands({ onSection, setNotice }: Deps): Command[] {
  return [
    ...SECTION_IDS.map((id) => ({
      id,
      label: `Go to ${SECTION_LABELS[id]}`,
      hint: 'section',
      keywords: `${SECTION_LABELS[id]} navigate`,
      run: () => onSection(id),
    })),
    ...CARS.map((car, index) => ({
      id: `car-${index}`,
      label: `Show ${car.name}`,
      hint: String(index + 1),
      keywords: `${car.name} ${car.code} vehicle garage`,
      run: () => {
        const state = useAppStore.getState();
        if (!state.isCarLoading && state.carIndex !== index) state.setCarIndex(index);
      },
    })),
    {
      id: 'next-car',
      label: 'Next car',
      hint: '→',
      keywords: 'car vehicle switch',
      run: () => {
        const state = useAppStore.getState();
        if (!state.isCarLoading) state.cycleCar();
      },
    },
    {
      id: 'previous-car',
      label: 'Previous car',
      hint: '←',
      keywords: 'car vehicle switch',
      run: () => {
        const state = useAppStore.getState();
        if (!state.isCarLoading) state.prevCar();
      },
    },
    {
      id: 'repaint',
      label: 'Change paint color',
      hint: 'C',
      keywords: 'paint color body repaint',
      run: () => {
        const state = useAppStore.getState();
        if (!state.isCarLoading) state.cycleBodyColor();
      },
    },
    {
      id: 'theme',
      label: 'Toggle studio lighting',
      hint: 'B',
      keywords: 'theme background night day lighting',
      run: () => useAppStore.getState().toggleTheme(),
    },
    {
      id: 'surprise',
      label: 'Surprise me',
      hint: 'X',
      keywords: 'randomize surprise shuffle garage car paint lighting',
      run: () => {
        const state = useAppStore.getState();
        if (!state.isCarLoading) state.randomizeGarage();
      },
    },
    {
      id: 'rev',
      label: 'Rev the engine',
      hint: 'R',
      keywords: 'engine car rumble shake',
      run: () => useAppStore.getState().triggerRev(),
    },
    {
      id: 'reset-view',
      label: 'Reset camera view',
      hint: 'V',
      keywords: 'camera view orbit reset',
      run: () => useAppStore.getState().resetCamera(),
    },
    {
      id: 'share-garage',
      label: 'Share this garage',
      hint: 'link',
      keywords: 'share copy car paint lighting garage',
      closeOnRun: false,
      run: async () => {
        const result = await shareCurrentScene();
        setNotice(
          result === 'shared'
            ? 'Garage shared'
            : result === 'copied'
              ? 'Garage link copied'
              : 'Could not share the garage',
        );
      },
    },
  ];
}

export function matchCommands(commands: Command[], query: string): Command[] {
  const needle = query.trim().toLowerCase();
  return commands.filter((command) =>
    `${command.label} ${command.keywords}`.toLowerCase().includes(needle),
  );
}
