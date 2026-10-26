import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';

// Bake the original canvas gradient losslessly so visitors need no extra 2D context.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const dataUrl = await page.evaluate(() => {
    const size = 256;
    const canvas = globalThis.document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.22)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return canvas.toDataURL('image/png');
  });
  const directory = new URL('../public/textures/', import.meta.url);
  await mkdir(directory, { recursive: true });
  const pixels = PNG.sync.read(Buffer.from(dataUrl.split(',')[1], 'base64'));
  const encoded = PNG.sync.write(pixels, { deflateLevel: 9, colorType: 4 });
  if (!PNG.sync.read(encoded).data.equals(pixels.data))
    throw new Error('Glow encoding must preserve every RGBA value.');
  await writeFile(new URL('underglow.png', directory), encoded);
  console.log('Generated public/textures/underglow.png from the original gradient.');
} finally {
  await browser.close();
}
