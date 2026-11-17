import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import portfolio from './vite.config';

const projectFile = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const effectsFile = projectFile('./src/three/Effects.tsx');

export default mergeConfig(
  portfolio,
  defineConfig({
    plugins: [
      {
        name: 'preview-car-type-overlap',
        enforce: 'pre',
        transform(source, id) {
          if (id !== effectsFile) return;
          const effects = 'export const Effects = memo(function Effects() {';
          const render = 'graph.composer.render(dt);';
          if (!source.includes(effects) || !source.includes(render)) {
            this.error('Could not attach the preview to the showroom renderer.');
          }
          return (
            "import { useCarTypeOverlap } from '../../art/ui-mocks/cinematic-study/CarTypeOverlap';\n" +
            source
              .replace(effects, `${effects}\n  const drawTypeOverlap = useCarTypeOverlap();`)
              .replace(render, `${render}\n      drawTypeOverlap(_state);`)
          );
        },
      },
    ],
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
  }),
);
