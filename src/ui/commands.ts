import { usePhotoMode } from './photo/state';
import { useLineup } from '../lineup/state';
import { CARS, GARAGE_INDICES, SECTION_IDS, SECTION_LABELS, type SectionId } from '../config';
import { shareCurrentScene } from '../sceneLink';
import { canStudyRender, useAppStore } from '../store';
import { cameraViews, type CameraView } from '../three/cameraViews';
import { CAR_ZOOM_MAX, CAR_ZOOM_MIN, CAR_ZOOM_STEP } from '../three/carZoom';

export type Command = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void | Promise<void>;
  closeOnRun?: boolean;
};

type Deps = {
  onSection: (id: SectionId) => void;
  setNotice: (text: string) => void;
  sceneUnavailable?: boolean;
};

export const COMMAND_GROUPS = ['Garage', 'Explore', 'Cars'] as const;
export function commandGroup(command: Command) {
  return command.id.startsWith('sec-')
    ? 'Explore'
    : command.id.startsWith('car-')
      ? 'Cars'
      : 'Garage';
}

export function buildCommands({
  onSection,
  setNotice,
  sceneUnavailable = useAppStore.getState().sceneUnavailable,
}: Deps): Command[] {
  const state = useAppStore.getState();
  const commands: Command[] = [
    {
      id: 'retry-scene',
      label: 'Retry 3D',
      hint: 'garage',
      keywords: 'retry restore showroom WebGL',
      run: () => {
        onSection('sec-intro');
        useAppStore.getState().retryScene();
      },
    },
    ...SECTION_IDS.map((id) => ({
      id,
      label: `Go to ${SECTION_LABELS[id]}`,
      hint: 'section',
      keywords: `${SECTION_LABELS[id]} navigate`,
      run: () => onSection(id),
    })),
    ...GARAGE_INDICES.map((index, position) => ({
      id: `car-${index}`,
      label: `Show ${CARS[index].name}`,
      hint: position < 9 ? String(position + 1) : 'select',
      keywords: `${CARS[index].name} ${CARS[index].code} vehicle garage`,
      run: () => {
        const state = useAppStore.getState();
        if (state.isCarLoading) return;
        onSection('sec-intro');
        if (state.carIndex !== index) state.setCarIndex(index);
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
      id: 'lineup',
      label: 'Lineup',
      hint: 'studio',
      keywords: 'compare scale Ferrari F40 Red Bull RB16B pair cars',
      run: () => useLineup.getState().open(),
    },
    {
      id: 'behind-the-render',
      label: 'Behind the render',
      hint: 'studio',
      keywords: 'clay matte finish materials lighting Ferrari F40',
      run: () => useAppStore.getState().setRenderFinish('studio'),
    },
    {
      id: 'photo-mode',
      label: 'Photo mode',
      hint: 'camera',
      keywords: 'photo capture screenshot postcard save image',
      run: () => usePhotoMode.getState().open(),
    },
    ...Object.entries(cameraViews(state)).map(([view, { label }]) => ({
      id: `view-${view}`,
      label,
      hint: 'camera',
      keywords: 'camera curated view angle shot',
      run: () => useAppStore.getState().setCameraView(view as CameraView),
    })),
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
      label: 'Cycle showroom lighting',
      hint: 'B',
      keywords: 'theme background studio dusk night lighting',
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
      id: 'pulse-lights',
      label: 'Pulse car lights',
      hint: 'car',
      keywords: 'lights glow pulse',
      run: () => useAppStore.getState().pulseCarLights(),
    },
    {
      id: 'reset-view',
      label: 'Reset camera view',
      hint: 'V',
      keywords: 'camera view orbit reset',
      run: () => useAppStore.getState().resetCamera(),
    },
    ...([-1, 1] as const).map((direction) => ({
      id: direction === 1 ? 'zoom-in' : 'zoom-out',
      label: direction === 1 ? 'Zoom in' : 'Zoom out',
      hint: 'camera',
      keywords: 'camera zoom magnify closer farther',
      run: () => {
        const state = useAppStore.getState();
        state.setCameraZoom(state.cameraZoom + direction * CAR_ZOOM_STEP);
      },
    })),
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
              : result === 'failed'
                ? 'Copy unavailable. Use the address bar link.'
                : '',
        );
      },
    },
  ];
  return commands
    .filter(({ id }) => {
      if (sceneUnavailable) return id.startsWith('sec-') || id === 'retry-scene';
      if (id === 'retry-scene') return false;
      if (id === 'behind-the-render') return canStudyRender(state);
      if (id === 'lineup' || id === 'photo-mode')
        return state.sectionIndex === 0 && !state.isCarLoading && !state.carLoadError;
      if (id.startsWith('view-'))
        return state.sectionIndex === 0 && !state.isCarLoading && !state.carLoadError;
      if (id.startsWith('zoom-'))
        return (
          state.sectionIndex === 0 &&
          !state.isCarLoading &&
          !state.carLoadError &&
          (id === 'zoom-in' ? state.cameraZoom < CAR_ZOOM_MAX : state.cameraZoom > CAR_ZOOM_MIN)
        );
      if (id === 'pulse-lights')
        return (
          !state.isCarLoading &&
          !state.carLoadError &&
          state.sectionIndex === 0 &&
          state.refs.lamps.length > 0
        );
      return id !== 'repaint' || !CARS[state.carIndex].fixedLivery;
    })
    .sort(
      (a, b) => COMMAND_GROUPS.indexOf(commandGroup(a)) - COMMAND_GROUPS.indexOf(commandGroup(b)),
    );
}

export function matchCommands(commands: Command[], query: string): Command[] {
  const needle = query.trim().toLowerCase();
  return commands.filter((command) =>
    `${command.label} ${command.keywords}`.toLowerCase().includes(needle),
  );
}

export function modifierKey(): '⌘' | 'Ctrl' {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘' : 'Ctrl';
}
