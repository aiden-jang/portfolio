import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import portfolio from './vite.config';

const projectFile = (path: string) => fileURLToPath(new URL(path, import.meta.url));
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
  }),
);
