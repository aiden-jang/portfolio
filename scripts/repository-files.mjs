import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const generated = new Set([
  'node_modules',
  'dist',
  '.git',
  'public',
  'test-results',
  'playwright-report',
]);

export function repositoryFiles(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (generated.has(entry.name) || entry.isSymbolicLink()) continue;
      const file = join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else files.push(relative(root, file));
    }
  };
  visit(root);
  return files;
}
