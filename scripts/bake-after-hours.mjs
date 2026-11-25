import { writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';

// Run against the repository's local Vite dev server after changing the low-light fixtures.
const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:5173');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const entry = new URL('/__bake-after-hours', origin).href;
  await page.route(entry, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>After Hours reflection bake</title>' }),
  );
  await page.goto(entry);
  const pixels = await page.evaluate(async () => {
    const module = '/src/three/studio/environment.ts';
    const source = await fetch(module).then((response) => response.text());
    const threePath = source.match(/from ["']([^"']+three\.js[^"']*)["']/)?.[1];
    if (!threePath) throw new Error('Vite did not resolve the Three.js module');
    const THREE = await import(threePath);
    const { createStudioEnvironment } = await import(module);
    const renderer = new THREE.WebGLRenderer();
    const generator = new THREE.PMREMGenerator(renderer);
    const target = createStudioEnvironment(generator, 'low-light');
    if (target.width !== 768 || target.height !== 1024) throw new Error('Unexpected atlas size');
    const rgba = new Uint16Array(target.width * target.height * 4);
    renderer.readRenderTargetPixels(target, 0, 0, target.width, target.height, rgba);
    if (!rgba.some((channel) => channel > 0)) throw new Error('The atlas is blank');
    const bytes = new Uint8Array(rgba.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 16384) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 16384));
    }
    return btoa(binary);
  });
  const destination = new URL('../public/showroom/after-hours.rgba16.gz', import.meta.url);
  await writeFile(destination, gzipSync(Buffer.from(pixels, 'base64'), { level: 9 }));
} finally {
  await browser.close();
}
