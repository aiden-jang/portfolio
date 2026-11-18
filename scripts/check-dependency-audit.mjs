import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const advisory = 'https://github.com/advisories/GHSA-fc5q-39xc-vjpf';
const expires = '2026-11-25T02:32:34Z';
const exceptionActive =
  process.env.GITHUB_ACTIONS === 'true' &&
  process.env.PORTFOLIO_CI_PICOMATCH_EXCEPTION === '1' &&
  Date.now() < Date.parse(expires);
const args = ['audit', '--audit-level=low'];

if (!exceptionActive) {
  const audit = spawnSync('npm', args, { stdio: 'inherit' });
  if (audit.error) console.error(audit.error);
  process.exit(audit.status ?? 1);
}

const audit = spawnSync('npm', [...args, '--json'], { encoding: 'utf8' });
if (audit.stderr) process.stderr.write(audit.stderr);
if (audit.error) console.error(audit.error);
if (audit.status === 0) {
  process.stdout.write(audit.stdout);
  process.exit(0);
}

process.stdout.write(audit.stdout ?? '');
if (audit.status !== 1) process.exit(audit.status ?? 1);

try {
  const report = JSON.parse(audit.stdout);
  const findings = report.vulnerabilities;
  const entries = Object.values(findings);
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const sources = entries.flatMap((finding) =>
    finding.via.filter((cause) => typeof cause !== 'string'),
  );

  // npm lists affected dependents separately. Allow only this root advisory and dev-only paths.
  const matchesException =
    report.auditReportVersion === 2 &&
    !report.error &&
    entries.length === report.metadata.vulnerabilities.total &&
    sources.length > 0 &&
    sources.every((source) => source.name === 'picomatch' && source.url === advisory) &&
    entries.every(
      (finding) =>
        finding.nodes.length > 0 &&
        finding.nodes.every((node) => lock.packages[node]?.dev === true) &&
        finding.via.length > 0 &&
        finding.via.every((cause) => typeof cause !== 'string' || Object.hasOwn(findings, cause)),
    );

  if (matchesException) {
    console.warn(`CI exception for dev-only picomatch through ${expires}. ${advisory}`);
    process.exit(0);
  }
} catch (error) {
  console.error('Could not validate the CI audit exception:', error.message);
}
process.exit(1);
