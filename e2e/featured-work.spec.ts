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
    await page.goto('/');
    const poster = page.getByRole('img', { name: /Globe centered on the North Pacific/ });
    await expect(poster).toBeAttached();
    const thumbnail = page.locator('.orbit-feature .preview-thumbnail');
    await thumbnail.evaluate((element) => {
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
    await expect(poster).not.toHaveCSS('opacity', '1');
    await scroll(1);
    await expect(poster).toHaveCSS('opacity', '1');
    await expect(page.locator('body')).toHaveAttribute('data-kamchatka-pulses', '1');
    await expect(thumbnail).not.toHaveAttribute('data-kamchatka-pulse');

    await scroll(0);
    await expect(poster).not.toHaveCSS('opacity', '1');
    await scroll(1);
    await expect(poster).toHaveCSS('opacity', '1');
    await expect(thumbnail).not.toHaveAttribute('data-kamchatka-pulse');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await scroll(0.5);
    await expect(poster).toHaveCSS('opacity', '1');
    await expect(thumbnail).not.toHaveAttribute('data-kamchatka-pulse');
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
    const inspect = page.getByRole('button', { name: 'Inspect the earthquake', exact: true });
    const story = page.getByRole('button', {
      name: 'How I built it: everythingisfine',
      exact: true,
    });
    await expect(inspect).toHaveCount(1, { timeout: 5000 });
    await expect(inspect).toBeInViewport({ ratio: 1 });
    await inspect.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'One earthquake. Two readings.' }),
    ).toBeFocused();
    const evidence = page.getByRole('region', { name: 'Off the east coast of Kamchatka' });
    await expect(evidence).toContainText('54.7 km deep');
    await expect(evidence).toContainText('71.0 km deep');
    const read = page.getByRole('button', { name: 'See how I matched the reports' });
    await read.click();
    const reader = page.getByRole('dialog');
    await expect(reader.getByText('One event on the globe', { exact: true })).toBeVisible();
    await reader.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(read).toBeFocused();
    await page.getByRole('button', { name: 'Back to the globe preview' }).click();
    await expect(inspect).toBeFocused();
    await story.click();
    await expect(reader.getByText('One event on the globe', { exact: true })).toBeVisible();
    await reader.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(story).toBeFocused();
    await page.getByRole('button', { name: 'Read my contribution to iodine' }).click();
    await expect(reader.getByText('.trim()', { exact: true })).toBeVisible();
    const undo = reader.getByRole('button', { name: 'Undo edit', exact: true });
    await undo.press('Enter');
    await expect(reader.getByText('Revert feedback queued', { exact: true })).toBeVisible();
    await expect(reader.getByRole('button', { name: 'Replay edit', exact: true })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
