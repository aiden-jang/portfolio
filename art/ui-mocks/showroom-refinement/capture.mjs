import { chromium, webkit } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { strict as assert } from 'node:assert';

const base = process.env.PORTFOLIO_MOCK_URL ?? 'http://127.0.0.1:5190';
const browserType = process.env.PORTFOLIO_MOCK_BROWSER === 'webkit' ? webkit : chromium;
const output = new URL(`../../ui-qa/showroom-refinement/${browserType.name()}/`, import.meta.url);
await mkdir(output, { recursive: true });
const browser = await browserType.launch();
const routes = [
  ['before', '/'],
  ['after', '/art/ui-mocks/showroom-refinement/'],
];
const sections = [
  ['intro', '#sec-intro'],
  ['experience', '#sec-experience'],
  ['projects', '#sec-work'],
  ['iodine', '#project-iodine'],
  ['gallery', '.project-gallery-heading'],
  ['about', '#sec-about'],
  ['contact', '#sec-contact'],
];
try {
  for (const [device, width, height] of [
    ['desktop', 1440, 1000],
    ['phone', 390, 844],
  ]) {
    for (const [version, route] of routes.filter(
      ([version]) =>
        !process.env.PORTFOLIO_MOCK_VERSION || process.env.PORTFOLIO_MOCK_VERSION === version,
    )) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/_vercel/**', (route) =>
        route.fulfill({ body: '', contentType: 'application/javascript' }),
      );
      await page.goto(base + route);
      await page.locator('.car-choice-status').first().waitFor({ state: 'attached' });
      await page.waitForFunction(
        () =>
          document.querySelector('canvas') &&
          document.querySelector('.car-choice-status')?.textContent === '',
        null,
        { timeout: 90000 },
      );
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2500);
      for (const [name, selector] of sections) {
        await page.locator(selector).evaluate((element) => {
          const top = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, top - (element.id.startsWith('sec-') ? 0 : 110));
        });
        await page.waitForTimeout(name === 'contact' ? 2500 : 350);
        await page.waitForFunction(
          () =>
            [...document.images]
              .filter((image) => {
                const rect = image.getBoundingClientRect();
                return rect.top < innerHeight && rect.bottom > 0 && rect.width > 0;
              })
              .every((image) => image.complete && image.naturalWidth > 0),
          null,
          { timeout: 15000 },
        );
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${device} ${name} overflows`,
        );
        await page.screenshot({
          path: new URL(`${version}-${device}-${name}.png`, output).pathname,
          animations: 'disabled',
        });
        console.log(`${version} ${device} ${name} captured`);
      }
      if (version === 'after') {
        const frames = await page
          .locator('.project-gallery .preview-thumbnail')
          .evaluateAll((elements) =>
            elements.map((element) => {
              const { width, height } = element.getBoundingClientRect();
              return { width, height };
            }),
          );
        for (const frame of frames) assert(Math.abs(frame.width / frame.height - 2) < 0.01);
        assert(
          Math.max(...frames.map((frame) => frame.height)) -
            Math.min(...frames.map((frame) => frame.height)) <
            1,
        );
        const names = await page.locator('.project-featured-group article h3').allTextContents();
        assert.deepEqual(names, ['everythingisfine', 'iodine']);
        assert.equal(await page.locator('.garage-project-compact').count(), 7);
        await page
          .locator('#project-everythingisfine')
          .getByRole('button', { name: 'How I built it: everythingisfine', exact: true })
          .click();
        await page.getByRole('dialog').waitFor();
        await page.screenshot({ path: new URL(`after-${device}-story.png`, output).pathname });
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({ state: 'detached' });
        const inspect = page.getByRole('button', {
          name: 'Inspect screenshot: everythingisfine',
          exact: true,
        });
        await inspect.click();
        await page
          .getByRole('dialog', { name: 'everythingisfine screenshot', exact: true })
          .waitFor();
        await page.keyboard.press('Escape');
        assert(await inspect.evaluate((element) => element === document.activeElement));
        await page
          .locator('#sec-intro')
          .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
        await page
          .getByRole('button', { name: /Browse cars\./ })
          .filter({ visible: true })
          .click();
        await page.getByRole('dialog', { name: 'Pick your ride.' }).waitFor();
        await page.screenshot({ path: new URL(`after-${device}-garage.png`, output).pathname });
        await page.keyboard.press('Escape');
        assert(
          await page
            .getByRole('button', { name: /Browse cars\./ })
            .filter({ visible: true })
            .evaluate((element) => element === document.activeElement),
        );
        if (device === 'phone') {
          for (const narrowWidth of [320, 768, 1024]) {
            await page.setViewportSize({ width: narrowWidth, height: 900 });
            await page
              .locator('#sec-work')
              .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
            assert(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              `overflow at ${narrowWidth}`,
            );
          }
        }
      }
      assert.deepEqual(errors, [], `${device} ${version} browser errors`);
      console.log(`${browserType.name()} ${version} ${device}: captures and layout checks passed`);
      await page.close();
    }
  }
  const review = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await review.goto(base + '/art/ui-mocks/showroom-refinement/review.html');
  await review.getByRole('button', { name: 'Phone · 390px', exact: true }).click();
  assert.equal(Math.round((await review.locator('iframe').boundingBox()).width), 390);
  await review.getByRole('button', { name: 'Current site', exact: true }).click();
  assert.equal(await review.locator('iframe').getAttribute('src'), '/#sec-intro');
  await review.getByRole('button', { name: 'Proposed polish', exact: true }).click();
  assert.equal(await review.locator('iframe').getAttribute('src'), './index.html#sec-intro');
  await review.close();
  console.log('Review frame: comparison and phone controls passed');
} finally {
  await browser.close();
}
