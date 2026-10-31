import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Model fixtures decode millions of coordinates; bound concurrent allocations.
    maxWorkers: 2,
  },
});
