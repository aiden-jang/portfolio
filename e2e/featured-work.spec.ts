import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`the showroom handoff follows scroll and highlights Kamchatka once at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('**/projects/globe-geography.bin.gz', (route) =>
      route.fulfill({ status: 503, body: 'Unavailable' }),
    );
    await page.goto('/');
    const poster = page.getByRole('img', { name: /Globe centered on the North Pacific/ });
    await expect(poster).toBeAttached();
    const art = page.locator('.orbit-art');
    await art.evaluate((element) => {
      let pulses = 0;
      element.addEventListener('animationstart', (event) => {
        if (event instanceof AnimationEvent && event.animationName === 'kamchatka-pulse') {
          document.body.dataset.kamchatkaPulses = String(++pulses);
        }
      });
    });
    const scroll = (fraction: number) =>
      page.evaluate((ratio) => {
        const projects = document.getElementById('sec-work')!;
        const top = scrollY + projects.getBoundingClientRect().top;
        scrollTo({ top: top * ratio, behavior: 'instant' });
      }, fraction);

    await scroll(0.5);
    await expect(poster).toHaveAttribute('aria-busy', 'false');
    await expect(art).not.toHaveCSS('opacity', '1');
    await scroll(1);
    await expect(art).toHaveCSS('opacity', '1');
    await expect(page.locator('body')).toHaveAttribute('data-kamchatka-pulses', '1');
    await expect(art).not.toHaveAttribute('data-kamchatka-pulse');

    await scroll(0);
    await expect(art).not.toHaveCSS('opacity', '1');
    await scroll(1);
    await expect(art).toHaveCSS('opacity', '1');
    await expect(art).not.toHaveAttribute('data-kamchatka-pulse');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await scroll(0.5);
    await expect(art).toHaveCSS('opacity', '1');
    await expect(art).not.toHaveAttribute('data-kamchatka-pulse');
  });
}

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
]) {
  test(`featured work actions and recorded evidence fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type === 'webgl' || type === 'webgl2') return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/#sec-work');
    await page.evaluate(() => document.fonts.ready);
    const inspect = page.getByRole('button', {
      name: 'Compare the Kamchatka reports',
      exact: true,
    });
    const story = page.getByRole('button', {
      name: 'How I built it: meanwhile.',
      exact: true,
    });
    await expect(inspect).toHaveCount(1, { timeout: 5000 });
    const snapshot = await page.request.get('/projects/orbit-snapshot.json');
    const { metadata } = await snapshot.json();
    await expect(page.locator('.earthquake-record time')).toHaveAttribute(
      'datetime',
      new Date(metadata.generated).toISOString(),
    );
    await expect(inspect).toBeInViewport({ ratio: 1 });
    await inspect.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'One earthquake. Two readings.' }),
    ).toBeFocused();
    const evidence = page.getByRole('region', { name: 'Off the east coast of Kamchatka' });
    await expect(evidence).toContainText('54.7 km');
    await expect(evidence).toContainText('71.0 km');
    await page.getByRole('button', { name: /EMSC.*71.0 km/ }).click();
    await expect(page).toHaveURL(/#quake\/kamchatka\/EMSC$/);
    const casePath = await page
      .getByRole('link', { name: 'See how I matched the reports' })
      .getAttribute('href');
    await page.goBack();
    await expect(inspect).toBeFocused();
    await page.goto(casePath!);
    await expect(page.getByRole('heading', { name: 'One quake. Two depths.' })).toBeVisible();
    await expect(page.getByRole('button', { name: /EMSC.*71.0 km/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('#globe-view, .garage-studio')).toHaveCount(0);
    await page.goto('/#sec-work');
    await story.click();
    const reader = page.getByRole('dialog');
    await expect(reader.getByText('One event on the globe', { exact: true })).toBeVisible();
    await reader.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(story).toBeFocused();
    const iodine = page.locator('#project-iodine');
    await iodine.getByRole('button', { name: 'Undo edit', exact: true }).press('Enter');
    await iodine.getByRole('link', { name: 'Read my contribution to iodine' }).click();
    await expect(page.getByRole('heading', { name: 'An edit you can take back.' })).toBeVisible();
    await expect(page).toHaveURL(/story=iodine&edit=restored$/);
    await page.reload();
    await expect(page.getByText('Revert feedback queued', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Do not assume the edit is still applied.', { exact: false }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'src/greeting.ts:2', exact: true }).first().click();
    await expect(page.locator('.iodine-evidence-line')).toBeFocused();
    await expect(page.getByRole('link', { name: 'View Iodine’s restore code' })).toHaveAttribute(
      'href',
      /editSnapshots\.ts#L92-L107$/,
    );
    await page.getByRole('button', { name: 'Replay edit', exact: true }).press('Enter');
    await expect(page.getByText('.trim()', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('the globe keeps the narrow-phone composition while WebGL loads', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let releaseGeography!: () => void;
  const gate = new Promise<void>((resolve) => {
    releaseGeography = resolve;
  });
  await page.route('**/projects/globe-geography.bin.gz', async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/#sec-work');
    const globe = page.locator('.orbit-feature');
    const art = globe.locator('.orbit-art');
    const heading = page.getByRole('heading', { name: 'meanwhile.', exact: true });
    const poster = globe.getByRole('img', { name: /Globe centered on the North Pacific/ });
    await expect(globe).toHaveAttribute('data-globe-phase', 'loading');
    await expect(poster).toBeVisible();
    await expect(poster).toHaveAttribute('aria-busy', 'false');
    await page.evaluate(() => document.fonts.ready);
    const originalFrame = await art.boundingBox();
    const originalHeading = await heading.boundingBox();
    expect(await poster.boundingBox()).toEqual(originalFrame);

    releaseGeography();
    const pause = globe.getByRole('button', { name: 'Pause rotation' });
    const resume = globe.getByRole('button', { name: 'Resume rotation' });
    await expect(pause).toBeVisible();
    expect(await art.boundingBox()).toEqual(originalFrame);
    expect(await heading.boundingBox()).toEqual(originalHeading);
    await expect(poster).toBeHidden();
    const canvas = globe.getByRole('img', { name: /Interactive globe/ });
    expect(await canvas.boundingBox()).toEqual(originalFrame);
    await pause.click();
    await expect(resume).toBeVisible();
    await resume.click();
    await expect(pause).toBeVisible();
    await canvas.press('ArrowRight');
    await expect(resume).toBeVisible();
    await globe.getByRole('button', { name: 'Reset globe' }).click();
    await globe.getByRole('button', { name: 'Show Kamchatka' }).press('Enter');
    await expect(globe.getByRole('complementary', { name: 'Selected earthquake' })).toContainText(
      'Kamchatka',
    );
  } finally {
    releaseGeography();
  }
});

for (const [width, height] of [
  [1440, 900],
  [390, 660],
]) {
  test(`case study openings keep saved evidence interactive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (value: string) => sessionStorage.setItem('copied-evidence', value),
        },
      });
    });

    await page.goto('/cases/iodine/');
    const evidence = page.getByRole('region', { name: 'Recorded Iodine edit recovery' });
    const undo = evidence.getByRole('button', { name: 'Undo edit', exact: true });
    await expect(undo).toBeInViewport({ ratio: 1, timeout: 4000 });
    const code = evidence.locator('.iodine-evidence-line');
    await expect(code).toContainText('.trim()');
    await undo.click();
    await expect(code).not.toContainText('.trim()');
    await expect(evidence.getByText('Revert feedback queued', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/cases\/iodine\/\?edit=restored$/);
    await page.getByRole('button', { name: 'Copy evidence link' }).click();
    const saved = await page.evaluate(() => sessionStorage.getItem('copied-evidence'));
    expect(saved).toMatch(/\/cases\/iodine\/\?edit=restored$/);
    await page.goto(saved!);
    await expect(evidence.getByText('File restored', { exact: true })).toBeVisible();
    await evidence.getByRole('button', { name: 'Replay edit', exact: true }).click();
    await expect(code).toContainText('.trim()');

    await page.goto('/cases/meanwhile/?agency=EMSC');
    const comparison = page.getByRole('region', { name: 'Kamchatka depth comparison' });
    const emsc = comparison.getByRole('button', { name: 'EMSC 71.0 km', exact: true });
    const usgs = comparison.getByRole('button', { name: 'USGS 54.7 km', exact: true });
    await expect(emsc).toBeInViewport({ ratio: 1 });
    await expect(emsc).toHaveAttribute('aria-pressed', 'true');
    await expect(comparison.getByText('20260817_0000423', { exact: true })).toBeVisible();
    await usgs.press('Enter');
    await expect(usgs).toHaveAttribute('aria-pressed', 'true');
    await expect(comparison.getByText('usd0015edq', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/cases\/meanwhile\/\?agency=USGS$/);
    await page.reload();
    await expect(usgs).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}
