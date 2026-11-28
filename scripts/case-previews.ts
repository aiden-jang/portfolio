import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const origin = 'https://www.aidenjang.com';
const cases = {
  'request-batching': {
    title: 'Ad Slot Details went from about a minute to two seconds. | Aiden Jang',
    description: 'How a batched API response cut page load from 60 seconds to 2.',
    image: '/projects/batch-share.png',
    alt: '120 requests collapse into one. 60 seconds to 2 seconds.',
  },
  meanwhile: {
    title: 'One quake. Two depths. | Aiden Jang',
    description: 'How meanwhile. matches two agencies’ earthquake reports and keeps both readings.',
    image: '/projects/kamchatka-globe.jpg',
    alt: 'Kamchatka earthquake marked on a globe.',
  },
  iodine: {
    title: 'An edit you can take back. | Aiden Jang',
    description:
      'Scoped terminal approvals, agent edit recovery and clickable file paths in Iodine.',
    image: '/projects/iodine.png',
    alt: 'Iodine’s code editor beside its agent session.',
  },
} as const;

export function casePreviews(): Plugin {
  return {
    name: 'case-previews',
    apply: 'build',
    writeBundle({ dir }, bundle) {
      if (!dir || !bundle['index.html']) return;
      const index = readFileSync(join(dir, 'index.html'), 'utf8');
      for (const [slug, story] of Object.entries(cases)) {
        const pathname = '/cases/' + slug + '/';
        const url = origin + pathname;
        const attributes: Record<string, string> = {
          description: story.description,
          'og:title': story.title,
          'og:description': story.description,
          'og:url': url,
          'og:image': origin + story.image,
          'og:image:alt': story.alt,
          'twitter:title': story.title,
          'twitter:description': story.description,
          'twitter:image': origin + story.image,
          'twitter:image:alt': story.alt,
        };
        const page = index
          .replace(/<title>[^<]*<\/title>/, () => '<title>' + story.title + '</title>')
          .replace(/(<link rel="canonical" href=")[^"]+/, (_, prefix) => prefix + url)
          .replace(/\s*<meta property="og:image:(?:width|height)" content="[^"]*"\s*\/?>/g, '')
          .replace(/(<meta\s+(?:name|property)="([^"]+)"\s+content=")[^"]*/g, (tag, prefix, key) =>
            key in attributes ? prefix + attributes[key] : tag,
          )
          .replace(/(["'])\.\/assets\//g, '$1../../assets/')
          .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
          .replace(
            /<main class="mx-auto[^"]*">[\s\S]*?<\/main>/,
            () =>
              '<main><h1>' +
              story.title +
              '</h1><p>' +
              story.description +
              '</p><a href="../../">Portfolio</a></main>',
          );
        const folder = join(dir, pathname);
        mkdirSync(folder, { recursive: true });
        writeFileSync(join(folder, 'index.html'), page);
      }
    },
  };
}
