// Line ceilings for the files with a history of sprawling. A ceiling is a promise the file will
// not grow, so entries only move down: shrink a file, lower its number in the same commit.
// SLACK keeps ordinary edits from failing the check; it is not room for a ceiling to drift into.
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repositoryFiles } from './repository-files.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SLACK = 40;

const CEILINGS = {
  'src/ui/WorkModal.tsx': 170,
  'src/ui/CommandMenu.tsx': 181,
  'src/three/CameraRig.tsx': 125,
  'scripts/check-size.mjs': 65,
  'scripts/check-comments.mjs': 47,
  'scripts/check-tests.mjs': 40,
};

// Anything this long should be under a ceiling, so a new god file cannot appear unnoticed.
const UNLISTED_LIMIT = 300;
const SOURCE = /\.(ts|tsx|mjs|js)$/;

// Counted the way `wc -l` does, so these numbers match whatever anyone checks them against.
const lines = (file) => {
  const parts = readFileSync(join(ROOT, file), 'utf8').split('\n');
  if (parts.at(-1) === '') parts.pop();
  return parts.length;
};

const problems = [];

for (const [file, ceiling] of Object.entries(CEILINGS)) {
  let actual;
  try {
    actual = lines(file);
  } catch {
    problems.push(`${file} has a ceiling but does not exist. Remove the entry.`);
    continue;
  }
  if (actual > ceiling) problems.push(`${file} is ${actual} lines, over its ${ceiling} ceiling.`);
  else if (ceiling - actual > SLACK)
    problems.push(
      `${file} is ${actual} lines but its ceiling is ${ceiling}. Lower it to ${actual}.`,
    );
}

for (const file of repositoryFiles(ROOT).filter(
  (file) => SOURCE.test(file) && !/\.(test|spec)\./.test(file),
)) {
  if (file in CEILINGS) continue;
  const actual = lines(file);
  if (actual > UNLISTED_LIMIT)
    problems.push(`${file} is ${actual} lines and has no ceiling. Add one, or split the file.`);
}

if (problems.length) {
  console.error('check-size failed:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(
  `check-size: ${Object.keys(CEILINGS).length} ceilings held, nothing unlisted over ${UNLISTED_LIMIT} lines.`,
);
