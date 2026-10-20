import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

function patchBrightness(image: PNG, centerX: number, centerY: number): number {
  let total = 0;
  for (let y = centerY - 5; y <= centerY + 5; y++) {
    for (let x = centerX - 5; x <= centerX + 5; x++) {
      const offset = (y * image.width + x) * 4;
      total += (image.data[offset] + image.data[offset + 1] + image.data[offset + 2]) / 3;
    }
  }
  return total / 121;
}

test('bright reflections do not cut dark halos into the floor glow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.setFixedTime(new Date('2026-10-13T18:00:00Z'));
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
  const effects = page.waitForResponse('**/Effects-*.js');
  await page.goto('/?car=1&paint=original&light=dusk');
  await effects;
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  // Let the effects shaders and exposure transition settle before sampling the floor.
  await page.waitForTimeout(2000);
  const image = PNG.sync.read(await page.screenshot());
  // Both patches are outside the car. Glow should brighten toward the headlights;
  // the broken smoothing pass instead painted an abrupt, nearly black patch here.
  const reflectedOuter = patchBrightness(image, 320, 700);
  const reflectedInner = patchBrightness(image, 375, 700);
  expect(
    reflectedInner,
    'the reflected headlights must not cut a dark hole into their glow',
  ).toBeGreaterThan(reflectedOuter * 0.95);
  const outer = patchBrightness(image, 320, 520);
  const inner = patchBrightness(image, 375, 520);
  expect(inner, 'the headlight halo must not darken the surrounding floor').toBeGreaterThan(
    outer * 0.95,
  );
});
