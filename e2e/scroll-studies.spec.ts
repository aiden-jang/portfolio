import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`timed demos and scroll studies keep their states at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.startsWith('webgl')) return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/#sec-work');
    const iodine = page.locator('#project-iodine');
    const recovery = iodine.getByRole('status');
    async function seekScene(id: string, progress: number) {
      await page.locator(id).evaluate((element, amount) => {
        const body = element.querySelector<HTMLElement>('[data-study-pin]')!;
        const travel = (element as HTMLElement).offsetHeight - body.offsetHeight;
        const inset = parseFloat(getComputedStyle(body).top);
        scrollTo({
          top: scrollY + element.getBoundingClientRect().top - inset + travel * amount,
          behavior: 'instant',
        });
      }, progress);
    }
    function place(selector: string, offset: number) {
      return page.locator(selector).evaluate((element, top) => {
        scrollTo({
          top: scrollY + element.getBoundingClientRect().top - innerHeight * top,
          behavior: 'instant',
        });
      }, offset);
    }
    await place('.orbit-feature', 0.2);
    const retryGlobe = page.getByRole('button', {
      name: 'Retry globe',
      exact: true,
    });
    const exploreGlobe = page.getByRole('button', {
      name: 'Explore globe',
      exact: true,
    });
    await expect(retryGlobe.or(exploreGlobe)).toBeVisible();
    if (await exploreGlobe.isVisible()) await exploreGlobe.click();
    await expect(retryGlobe).toBeVisible();
    await expect(recovery).toHaveText('Agent edit');
    await place('#project-iodine', 0.1);
    const parkedEditor = await page.evaluate(() => scrollY);
    await expect(recovery).toHaveText('Edit undone');
    await expect(iodine.locator('video')).toHaveCount(0);
    await expect(recovery).toHaveText('Agent edit');
    await expect(recovery).toHaveText('Edit undone');
    expect(await page.evaluate(() => scrollY)).toBe(parkedEditor);

    const batch = page.locator('.batching-spread');
    await seekScene('.batch-lane', 0.25);
    const position = () => batch.evaluate((el) => Number(el.getAttribute('data-pulse')));
    await expect.poll(position).toBeGreaterThan(0.25);
    const partialBatch = await position();
    // Wait longer than the former settle animation to catch a diagram that still moves at rest.
    await page.waitForTimeout(460);
    expect(await position()).toBe(partialBatch);
    await seekScene('.batch-lane', 0.08);
    await expect.poll(position).toBeLessThan(partialBatch);

    const quake = page.locator('#project-everythingisfine');
    const verdict = quake.getByRole('complementary', {
      name: 'Recorded Kamchatka depth readings',
    });
    await place('#sec-work', 0);
    const parkedScroll = await page.evaluate(() => scrollY);
    await expect(verdict).toHaveCSS('opacity', '1');
    await expect(verdict).toContainText('54.7 km');
    await expect(verdict).toContainText('71.0 km');
    expect(await page.evaluate(() => scrollY)).toBe(parkedScroll);
    await place('#sec-work', 0.8);
    await expect(verdict).toBeHidden();

    await place('#project-iodine', 0.11);
    await expect(recovery).toHaveText('Edit undone');
    await expect(
      iodine.getByRole('link', { name: 'My open-source contributions' }),
    ).toHaveAttribute('href', /edit=restored/);

    const track = page.locator('.scroll-film-track');
    const stage = page.locator('.rear-finish-stage');
    await page.evaluate(() => {
      location.hash = 'f40-study';
    });
    const progress = () => page.locator('.rear-finish').evaluate((el) => Number(el.dataset.finish));
    await expect.poll(progress).toBe(0);
    const scrub = async (fraction: number) =>
      track.evaluate((el, fraction) => {
        const travel = el.clientHeight - el.firstElementChild!.clientHeight;
        scrollBy({
          top: el.getBoundingClientRect().top + travel * fraction,
          behavior: 'instant',
        });
      }, fraction);
    const email = page.getByRole('heading', {
      name: 'me@aidenjang.com',
      exact: true,
    });
    await expect(email).toBeHidden();
    const start = await track.getByRole('slider').boundingBox();
    await scrub(0.44);
    await expect.poll(progress).toBeGreaterThan(0.48);
    const mid = await track.getByRole('slider').boundingBox();
    expect(mid!.y).toBeCloseTo(start!.y, 0);
    await expect(track.locator('.scroll-film')).toHaveCSS('position', 'sticky');
    expect(
      await track
        .locator('.scroll-film')
        .evaluate((el) => getComputedStyle(el, '::before').content),
    ).toBe('none');
    await scrub(0.92);
    await expect.poll(progress).toBe(1);
    const paintedStill = stage.locator('.rear-paint img');
    const paint = await paintedStill.evaluate((el: HTMLImageElement) => el.currentSrc);
    await expect(stage.locator('.rear-paint')).toHaveCSS('opacity', '1');
    await expect(email).toBeInViewport();
    await page.evaluate(() => {
      location.hash = 'sec-contact';
    });
    await expect(email.getByRole('link')).toBeInViewport();
    await expect(stage.locator('.rear-paint')).toHaveCSS('opacity', '1');
    expect(await paintedStill.evaluate((el: HTMLImageElement) => el.currentSrc)).toBe(paint);
    await scrub(0.3);
    await expect.poll(progress).toBeLessThan(0.4);
    await expect(email).toBeHidden();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => {
      location.hash = 'f40-study';
    });
    const slider = track.getByRole('slider');
    await expect(slider).toBeInViewport();
    await slider.fill('100');
    await expect.poll(progress).toBe(1);
  });
}
