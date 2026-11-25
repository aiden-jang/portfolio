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
    await expect(page.getByRole('button', { name: 'Retry globe', exact: true })).toBeVisible();
    await expect(recovery).toHaveText('Agent edit');
    await place('#project-iodine .recovery', 0.22);
    const parkedEditor = await page.evaluate(() => scrollY);
    await expect(recovery).toHaveText('Edit undone');
    await expect(iodine.getByRole('button', { name: /^(Undo|Replay) edit$/ })).toHaveCount(0);
    expect(await page.evaluate(() => scrollY)).toBe(parkedEditor);
    await expect(recovery).toHaveText('Agent edit');
    await expect(recovery).toHaveText('Edit undone');

    const batch = page.locator('.batching-spread');
    await seekScene('.batch-lane', 0.25);
    const position = () =>
      batch.evaluate((el) => parseInt(el.style.getPropertyValue('--batch-scroll-time')));
    await expect.poll(position).toBeGreaterThan(250);
    const partialBatch = await position();
    // Wait longer than the former settle animation to catch a diagram that still moves at rest.
    await page.waitForTimeout(460);
    expect(await position()).toBe(partialBatch);
    await seekScene('.batch-lane', 0.08);
    await expect.poll(position).toBeLessThan(partialBatch);

    const garden = page.locator('#project-bloomnote');
    await place('#project-bloomnote .bloom-garden-plot', 0.4);
    const parkedGarden = await page.evaluate(() => scrollY);
    await expect(garden).toHaveAttribute('data-study-progress', '1.000');
    expect(await page.evaluate(() => scrollY)).toBe(parkedGarden);
    await place('#project-bloomnote .bloom-garden-plot', 0.6);
    await expect(garden).toHaveAttribute('data-study-progress', '1.000');

    const drawing = page.getByRole('figure', { name: 'Recorded iguess drawing round' });
    await seekScene('.duet', 0.45);
    await expect(drawing.getByRole('status')).toHaveText('Guitar');
    const drawingPin = page.locator('.duet [data-study-pin]');
    expect(
      await drawingPin.evaluate((el) =>
        Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).top)),
      ),
    ).toBeLessThan(2);
    const parkedDrawing = await page.evaluate(() => scrollY);
    await expect(drawing.getByRole('status')).toHaveText('What is it?');
    await expect(drawing.getByRole('status')).toContainText('A rocket');
    await expect(drawing.getByRole('status')).toHaveText('Guitar');
    expect(await page.evaluate(() => scrollY)).toBe(parkedDrawing);
    const room = page.locator('#project-mrrp .bean-window');
    await seekScene('.duet', 0.94);
    await expect(room).toHaveAttribute('data-light', 'morning');
    await seekScene('.duet', 0.71);
    await expect(room).toHaveAttribute('data-light', 'evening');
    const verdict = page.locator('#project-everythingisfine .quake-journey-readings');
    await seekScene('#project-everythingisfine', 0.78);
    const parkedScroll = await page.evaluate(() => scrollY);
    await expect(verdict).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => scrollY)).toBe(parkedScroll);
    const quake = page.locator('#project-everythingisfine');
    async function nudgeSettledReading(progress: number) {
      const settled = await quake.getAttribute('data-study-progress');
      await seekScene('#project-everythingisfine', progress);
      await page.evaluate(
        () =>
          new Promise<void>((done) =>
            requestAnimationFrame(() => requestAnimationFrame(() => done())),
          ),
      );
      expect(await quake.getAttribute('data-study-progress')).toBe(settled);
    }
    await expect(quake).toHaveAttribute('data-study-progress', '0.940');
    await nudgeSettledReading(0.8);
    await nudgeSettledReading(0.82);
    await seekScene('#project-everythingisfine', 0.56);
    await expect(quake).toHaveAttribute('data-study-progress', '0.570');
    await expect(verdict).toHaveCSS('opacity', '1');
    await nudgeSettledReading(0.54);
    await seekScene('#project-everythingisfine', 0.16);
    await expect(verdict).toHaveCSS('opacity', '0');
    await expect(page.locator('#project-everythingisfine')).toHaveAttribute(
      'data-quake-view',
      'globe',
    );

    const featured = page.locator('.project-featured-group');
    const gridOpacity = () =>
      iodine
        .locator('.recovery-source')
        .evaluate((el) => Number(getComputedStyle(el, '::before').opacity));
    const approachEditor = () => place('#project-iodine .recovery', 0.69);
    await seekScene('#project-everythingisfine', 0.96);
    await expect(quake).toHaveAttribute('data-quake-view', 'map');
    await approachEditor();
    await expect(featured).toHaveAttribute('data-map-editor-cut', '');
    await expect.poll(gridOpacity).toBeGreaterThan(0.25);
    await place('#project-iodine .recovery', 0.2);
    await expect(recovery).toHaveText('Edit undone');
    await expect(featured).not.toHaveAttribute('data-map-editor-cut');
    await approachEditor();
    await expect(recovery).toHaveText('Edit undone');
    await expect.poll(gridOpacity).toBeGreaterThan(0.25);
    await expect(iodine.getByRole('link', { name: 'Read the iodine case study' })).toHaveAttribute(
      'href',
      /edit=restored/,
    );

    const track = page.locator('.scroll-film-track');
    const video = track.locator('video');
    const slider = track.getByRole('slider');
    const scroll = (amount: number) =>
      track.evaluate((element, amount) => {
        const travel = element.clientHeight - element.firstElementChild!.clientHeight;
        scrollTo({
          top: scrollY + element.getBoundingClientRect().top + travel * amount,
          behavior: 'instant',
        });
      }, amount);
    await scroll(0);
    await expect(slider).toHaveValue('0');
    const stage = await track.locator('.scroll-film').boundingBox();
    expect(stage!.width).toBeGreaterThanOrEqual(width - 1);
    expect(stage!.height).toBeGreaterThanOrEqual(843);
    if (width === 390) {
      const frames = track.locator('canvas');
      await expect(frames).toBeVisible();
      await expect(frames).toHaveCSS('animation-name', 'none');
      await expect(video).not.toHaveAttribute('src', /mp4/);
      const image = () => frames.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
      const clay = await image();
      await scroll(0.57);
      await expect(slider).toHaveValue('54');
      await expect.poll(image).not.toBe(clay);
      const mid = await image();
      await slider.fill('70');
      await expect(slider).toHaveValue('70');
      await scroll(0.95);
      await expect(slider).toHaveValue('100');
      await expect.poll(image).not.toBe(mid);
      await scroll(0);
      await expect(slider).toHaveValue('0');
      await expect.poll(image).toBe(clay);
    } else {
      await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.videoWidth)).toBe(1152);
      const time = () => video.evaluate((el: HTMLVideoElement) => el.currentTime);
      await scroll(0.82);
      await expect.poll(time).toBeGreaterThan(3.3);
      const beforeFinalTurn = await time();
      expect(beforeFinalTurn).toBeLessThan(3.6);
      await scroll(0.88);
      await expect.poll(time).toBeGreaterThan(beforeFinalTurn + 0.21);
      expect(await time()).toBeLessThan(3.95);
      await scroll(0.95);
      await expect.poll(time).toBeGreaterThan(3.96);
      await expect(video).toBeVisible();
      await scroll(0.26);
      await expect
        .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
        .toBeLessThan(1.5);
    }
    await expect(track.locator('.finish-detail')).toHaveCount(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(featured).not.toHaveAttribute('data-map-editor-cut');
    await expect(video).not.toHaveAttribute('src', /mp4/);
    await expect(track.locator('canvas')).toBeHidden();
    await slider.fill('100');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Paint');
    await expect(track.locator('.finish-poster-paint')).toHaveCSS('opacity', '1');

    await place('#project-iodine .recovery', 0.22);
    await expect(recovery).toHaveText('Edit undone');
    await expect(iodine.getByRole('button', { name: 'Replay edit', exact: true })).toHaveCount(0);
    await expect(garden.locator('.bloom-garden-plant img').first()).toHaveCSS('clip-path', 'none');
    await expect(drawing.getByRole('status')).toHaveText('Guitar');
  });
}
