// A green run is not a full run. One `describe.skip` leaves vitest exiting 0 while quietly
// running fewer tests than it did yesterday, and so does deleting a file. The floor is what
// notices; it only ever moves up.
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const FLOOR = 78;

const run = spawnSync('npx', ['vitest', 'run'], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
});
// CI turns vitest's colours on, which puts escape codes between "Tests" and the count and makes
// the summary unmatchable. Strip them rather than trusting an env var the child may ignore.
const ansi = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const output = `${run.stdout ?? ''}${run.stderr ?? ''}`.replace(ansi, '');
const summary = output.match(/Tests\s+(?:(\d+) failed \| )?(\d+) passed/);

const problems = [];
let passed = NaN;

if (!summary) {
  problems.push('vitest printed no test summary. Did the suite run at all?');
} else {
  const failed = Number(summary[1] ?? 0);
  passed = Number(summary[2]);
  if (failed > 0) problems.push(`${failed} failing test(s).`);
  else if (passed < FLOOR) problems.push(`ran ${passed} tests, below the floor of ${FLOOR}.`);
  else if (passed > FLOOR) problems.push(`now runs ${passed} tests. Raise the floor to ${passed}.`);
}

if (problems.length) {
  console.error('check-tests failed:');
  for (const problem of problems) console.error(`  ${problem}`);
  if (!summary) console.error(output.trimEnd());
  process.exit(1);
}
console.log(`check-tests: ${passed} tests passed, floor ${FLOOR}.`);
