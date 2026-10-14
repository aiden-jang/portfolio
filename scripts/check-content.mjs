import { fileURLToPath } from 'node:url';
import { repositoryFiles } from './repository-files.mjs';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const issues = [];
const files = repositoryFiles(root).map((file) => join(root, file));

function requireFile(file, owner) {
  try {
    if (statSync(file).isFile()) return true;
  } catch {
    /* Report missing files with their referring document. */
  }
  issues.push(`${relative(root, owner)} references missing file ${relative(root, file)}`);
  return false;
}

for (const file of files.filter((file) => file.endsWith('.md'))) {
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const match of text.matchAll(/\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^[a-z][a-z\d+.-]*:/i.test(target)) continue;
    const [path, fragment] = target.split('#');
    const destination = path ? resolve(dirname(file), decodeURIComponent(path)) : file;
    if (!requireFile(destination, file) || !fragment || !destination.endsWith('.md')) continue;
    const headings = readFileSync(destination, 'utf8').match(/^#{1,6} .+$/gm) ?? [];
    const anchors = headings.map((heading) =>
      heading
        .replace(/^#+ /, '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N} _-]/gu, '')
        .replace(/ /g, '-'),
    );
    if (!anchors.includes(decodeURIComponent(fragment)))
      issues.push(`${relative(root, file)} references missing heading ${target}`);
  }
}

for (const file of files.filter((file) => /\.(tsx?|css)$/.test(file) && file.includes('/src/'))) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/['"](\/(?:projects|fonts|cars|models)\/[^'"${}]+)['"]/g)) {
    requireFile(join(root, 'public', match[1]), file);
  }
}

const html = readFileSync(join(root, 'index.html'), 'utf8');
const canonical = /rel="canonical" href="([^"]+)"/.exec(html)?.[1];
if (!canonical) issues.push('index.html has no canonical URL');
else {
  const sitemap = readFileSync(join(root, 'public/sitemap.xml'), 'utf8');
  const robots = readFileSync(join(root, 'public/robots.txt'), 'utf8');
  if (!sitemap.includes(`<loc>${canonical}</loc>`))
    issues.push('sitemap and canonical URL disagree');
  if (!robots.includes(`Sitemap: ${new URL('sitemap.xml', canonical).href}`))
    issues.push('robots.txt points to a different sitemap');
  for (const match of html.matchAll(/https:\/\/[^"\s]+\/(?:og-image\.png|icon-\d+\.png)/g)) {
    requireFile(join(root, 'public', new URL(match[0]).pathname), join(root, 'index.html'));
  }
}
for (const match of html.matchAll(/(?:href|src)="(\/[^"#]+)"/g)) {
  const owner = join(root, 'index.html');
  requireFile(join(root, match[1].startsWith('/src/') ? '' : 'public', match[1]), owner);
}
const manifestPath = join(root, 'public/manifest.webmanifest');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
for (const icon of manifest.icons ?? []) requireFile(join(root, 'public', icon.src), manifestPath);
const schema = JSON.parse(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '{}',
);
if (schema['@graph']?.some((entry) => 'worksFor' in entry))
  issues.push('Employer details belong in snippet-excluded content, not profile metadata');
const site = schema['@graph']?.find((entry) => entry['@type'] === 'WebSite');
const siteName = /property="og:site_name" content="([^"]+)"/.exec(html)?.[1];
if (!site || site.name !== siteName || site.url !== canonical)
  issues.push('website structured data and metadata disagree');

if (issues.length) {
  console.error(`check-content failed:\n${issues.map((issue) => `  ${issue}`).join('\n')}`);
  process.exit(1);
}
console.log(
  'check-content: local documentation links, public references and search metadata agree.',
);
