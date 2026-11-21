import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import portfolio from './vite.config';

const projectFile = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  ...portfolio,
  build: {
    ...portfolio.build,
    outDir: 'art/ui-qa/opening-orbit/dist',
    rollupOptions: {
      ...portfolio.build?.rollupOptions,
      input: [
        projectFile('./art/ui-mocks/cinematic-study/review.html'),
        projectFile('./art/ui-mocks/cinematic-study/index.html'),
      ],
    },
  },
  preview: { host: '127.0.0.1', port: 5199, strictPort: true, open: false },
});
