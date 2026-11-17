import { webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
const out = new URL('../../ui-qa/product-confidence/', import.meta.url).pathname;
const base = process.env.PORTFOLIO_MOCK_URL ?? 'http://127.0.0.1:5196';
await mkdir(out, { recursive: true });
const browser = await webkit.launch();
const report = [];
try {
  for (const [device, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    for (const [version, route] of [
      ['before', '/'],
      ['after', '/art/ui-mocks/product-confidence/'],
    ].filter(
      ([version]) =>
        !process.env.PORTFOLIO_MOCK_VERSION || process.env.PORTFOLIO_MOCK_VERSION === version,
    )) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: 'reduce',
        hasTouch: device === 'mobile',
      });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.route('**/_vercel/**', (r) => r.fulfill({ body: '' }));
      await page.goto(base + route);
      await page
        .getByRole('button', { name: 'Zoom in', exact: true })
        .filter({ visible: true })
        .waitFor();
      await page.waitForFunction(() => document.querySelector('canvas'));
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll('button[aria-label="Zoom in"]')].some(
            (e) => e.getBoundingClientRect().width > 0 && !e.disabled,
          ),
        null,
        { timeout: 90000 },
      );
      await page.evaluate(() => document.fonts.ready);
      let visibleCar = false;
      const deadline = Date.now() + 90000;
      while (!visibleCar && Date.now() < deadline) {
        const buffer = await page.screenshot({ path: `${out}/${version}-${device}-intro.png` });
        const png = PNG.sync.read(buffer);
        let red = 0;
        for (let y = Math.floor(height * 0.28); y < height * 0.78; y++)
          for (let x = 0; x < width; x++) {
            const i = (y * png.width + x) * 4;
            if (
              png.data[i] > 80 &&
              png.data[i] > png.data[i + 1] * 1.8 &&
              png.data[i] > png.data[i + 2] * 1.5
            )
              red++;
          }
        visibleCar = red > 1000;
        if (!visibleCar) await page.waitForTimeout(1000);
      }
      if (!visibleCar) throw Error('The car did not render in the capture');
      for (const [name, selector] of [
        ['projects', '#sec-work'],
        ['experience', '#sec-experience'],
        ['collection', '#sec-more-work'],
        ['about', '#sec-about'],
        ['contact', '#sec-contact'],
      ]) {
        await page
          .locator(selector)
          .evaluate((e) => e.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await page.waitForTimeout(name === 'contact' ? 1000 : 500);
        await page.waitForFunction(() =>
          [...document.images]
            .filter(
              (i) =>
                i.getBoundingClientRect().width > 0 &&
                i.getBoundingClientRect().top < innerHeight &&
                i.getBoundingClientRect().bottom > 0,
            )
            .every((i) => i.complete && i.naturalWidth),
        );
        if (name !== 'contact')
          await page.evaluate(
            () => (document.querySelector('.portfolio-header').style.visibility = 'hidden'),
          );
        await page
          .locator(selector)
          .screenshot({ path: `${out}/${version}-${device}-${name}.png`, animations: 'disabled' });
        await page.evaluate(
          () => (document.querySelector('.portfolio-header').style.visibility = ''),
        );
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        if (overflow) throw Error(`${version} ${device} ${name} overflows`);
        report.push({ version, device, name, overflow });
        console.log(`${version} ${device} ${name} captured`);
      }
      if (version === 'after') {
        await page.locator('#project-iodine').scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Undo edit', exact: true }).click();
        const restored = await page.locator('.cinema-result strong').textContent();
        if (restored !== 'Restored. The agent gets the message.') throw Error('Undo failed');
        await page
          .getByRole('button', { name: 'Inspect Iodine editor screenshot', exact: true })
          .click();
        await page.getByRole('dialog', { name: 'iodine screenshot', exact: true }).waitFor();
        await page.keyboard.press('Escape');
        await page.locator('#sec-intro').evaluate((e) => e.scrollIntoView({ behavior: 'instant' }));
        await page
          .getByRole('button', { name: /Browse cars\./ })
          .filter({ visible: true })
          .click();
        await page.getByRole('dialog', { name: 'Pick your ride.' }).waitFor();
        await page.screenshot({ path: `${out}/after-${device}-garage.png` });
        await page.keyboard.press('Escape');
        if (device === 'mobile')
          for (const width of [320, 768, 1024]) {
            await page.setViewportSize({ width, height: 900 });
            const bounds = await page
              .locator('.garage-project-featured > figure')
              .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().width));
            if (bounds.some((w) => w < 200)) throw Error(`Featured image collapsed at ${width}`);
            if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
              throw Error(`Overflow at ${width}`);
          }
      }
      if (errors.length) throw Error(errors.join('\n'));
      report.push({ version, device, errors });
      await page.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(`${out}/review.json`, JSON.stringify(report, null, 2));
}
