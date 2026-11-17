import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import portfolio from './vite.config';

const projectFile = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const cameraRig = projectFile('./src/three/CameraRig.tsx');
const hook = '/art/ui-mocks/cinematic-study/useOpeningOrbit.ts';
const cameraSetup = '  const updateCameraView = useCameraViews();';
const frame = '    updateCameraView(s, dt, reduced, scrollT);';
const azimuth = 'kf.azimuth + s.dragAzimuth';

export default mergeConfig(
  portfolio,
  defineConfig({
    build: {
      outDir: 'art/ui-qa/opening-orbit/dist',
      rollupOptions: {
        input: [
          projectFile('./art/ui-mocks/cinematic-study/review.html'),
          projectFile('./art/ui-mocks/cinematic-study/index.html'),
        ],
      },
    },
    preview: { host: '127.0.0.1', port: 5199, strictPort: true, open: false },
    plugins: [
      {
        name: 'opening-orbit-preview',
        enforce: 'pre',
        transform(source, id) {
          if (id !== cameraRig) return;
          if (![cameraSetup, frame, azimuth].every((part) => source.includes(part)))
            this.error(
              'The showroom camera changed. Update the opening orbit preview integration.',
            );
          // Apply the preview offset before the existing framing, orbit input, and rendering.
          return (
            `import { useOpeningOrbit } from '${hook}';\n` +
            source
              .replace(cameraSetup, `${cameraSetup}\n  const openingOrbit = useOpeningOrbit();`)
              .replace(
                frame,
                '    const openingOffset = isCleanMode ? 0 : openingOrbit(s, dt, reduced, scrollT, three.size.width);\n' +
                  frame,
              )
              .replace(azimuth, `${azimuth} + openingOffset`)
          );
        },
      },
    ],
  }),
);
