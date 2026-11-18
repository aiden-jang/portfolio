import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });

test('the desktop opening orbit overlaps a stationary intro title', async ({ page }) => {
  await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
  let releaseModel!: () => void;
  const modelGate = new Promise<void>((resolve) => {
    releaseModel = resolve;
  });
  await page.route('**/models/ferrari-f120-f40.glb', async (route) => {
    await modelGate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const intro = page.getByRole('heading', { name: 'Aiden Jang', exact: true });
  const before = await intro.boundingBox();
  releaseModel();
  expect(before).not.toBeNull();

  const during = await page.waitForFunction(
    () => {
      const heading = document.querySelector('#sec-intro h1');
      const layer = document.querySelector<HTMLCanvasElement>('.car-type-overlap:not([hidden])');
      if (!heading || !layer || Number(layer.style.opacity) < 0.99) return;
      const { x, y } = heading.getBoundingClientRect();
      return { x, y };
    },
    undefined,
    { timeout: 90_000 },
  );
  const position = await during.jsonValue();
  expect(position?.x).toBeCloseTo(before!.x, 0);
  expect(position?.y).toBeCloseTo(before!.y, 0);
});
