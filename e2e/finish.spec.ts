import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1280, height: 320 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
]) {
  test(`compact garage keeps its controls and full paint palette at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/?car=0');
    const dock = page.locator('#desktop-dock');
    await expect(dock).toBeVisible();
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(dock.getByRole('button', { name: /Browse cars\./ })).toBeVisible();
    await expect(dock.getByRole('button', { name: /Lighting:/ })).toBeVisible();
    await expect(dock.getByRole('button', { name: 'Garage controls', exact: true })).toBeVisible();
    await dock.getByRole('button', { name: /Choose paint/ }).click();
    const paints = page.getByRole('group', { name: 'Paint colors', exact: true });
    await expect(paints).toBeVisible();
    await expect(paints.getByRole('button')).toHaveCount(7);
    await paints.getByRole('button', { name: 'Paint: Bordeaux', exact: true }).click();
    await expect(paints).toBeHidden();
    await expect(
      dock.getByRole('button', { name: 'Paint: Bordeaux. Choose paint', exact: true }),
    ).toBeFocused();
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('#702c43');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test('both lighting labels fit the dock without shifting its controls', async ({ page }) => {
  await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
  await page.goto('/?car=10');
  await page.evaluate(() => document.fonts.ready);
  const lighting = page.getByRole('button', { name: /^Lighting:/ }).filter({ visible: true });

  const measure = () =>
    lighting.evaluate((button) => {
      const label = button.querySelector('span')!;
      const text = document.createRange();
      text.selectNodeContents(label);
      const bounds = button.getBoundingClientRect();
      const dock = button.closest('.car-controls-row')!.getBoundingClientRect();
      return {
        width: bounds.width,
        x: bounds.x,
        textRight: text.getBoundingClientRect().right,
        contentRight: bounds.right - parseFloat(getComputedStyle(button).paddingRight),
        dockRight: dock.right,
        garageRight: button
          .closest('.car-controls-row')!
          .querySelector('.all-controls-trigger')!
          .getBoundingClientRect().right,
        available: label.clientWidth,
        required: label.scrollWidth,
      };
    });

  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [768, 432],
    [390, 844],
    [320, 568],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(lighting).toHaveAccessibleName('Lighting: Studio. Switch to After Hours');
    const studio = await measure();
    expect(studio.required, `Studio label at ${width}×${height}`).toBeLessThanOrEqual(
      studio.available + 1,
    );
    await lighting.click();
    await expect(lighting).toHaveAccessibleName('Lighting: After Hours. Switch to Studio');
    const afterHours = await measure();
    expect(afterHours.required, `After Hours label at ${width}×${height}`).toBeLessThanOrEqual(
      afterHours.available + 1,
    );
    expect(afterHours.textRight).toBeLessThanOrEqual(afterHours.contentRight + 1);
    expect(afterHours.garageRight).toBeLessThanOrEqual(afterHours.dockRight + 1);
    expect(afterHours.width).toBeCloseTo(studio.width, 0);
    expect(afterHours.x).toBeCloseTo(studio.x, 0);
    await lighting.click();
  }
});

for (const width of [1440, 390]) {
  test(`unavailable WebGL offers a static preview and a real retry at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      let unavailable = true;
      Object.assign(window, {
        enableTestWebGL: () => {
          unavailable = false;
        },
      });
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (unavailable && /webgl/i.test(type)) return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/?car=1&paint=%233f464e&light=night');
    await expect(page.getByText('Studio photographs · 3D is unavailable.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Browse cars\./ })).toBeHidden();
    await expect(page.getByRole('img', { name: 'Ferrari F40 · Opening angle' })).toBeVisible();
    const angles = page.getByRole('group', { name: 'F40 photographs' });
    for (const angle of ['Side profile', 'Rear deck']) {
      await angles.getByRole('button', { name: angle, exact: true }).click();
      const image = page.getByRole('img', { name: `Ferrari F40 · ${angle}` });
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
        .toBe(width === 390 ? 390 : 1440);
    }
    expect(new URL(page.url()).searchParams.get('paint')).toBe('#3f464e');
    await page.evaluate(() =>
      (window as unknown as { enableTestWebGL: () => void }).enableTestWebGL(),
    );
    await page.getByRole('button', { name: 'Retry 3D', exact: true }).click();
    const browse = page
      .getByRole('button', { name: 'Browse cars. Mercedes 300 SL, W198', exact: true })
      .filter({ visible: true });
    await expect(browse).toBeEnabled({ timeout: 60_000 });
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(browse).toBeFocused();
    expect(new URL(page.url()).searchParams.get('paint')).toBe('#3f464e');
    await expect(
      page
        .getByRole('button', { name: 'Lighting: After Hours. Switch to Studio', exact: true })
        .filter({ visible: true }),
    ).toBeVisible();
  });

  test(`failed preview images settle without changing the globe frame at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#sec-work');
    const project = page.locator('#project-everythingisfine');
    const thumbnail = project.locator('.preview-thumbnail');
    await expect(thumbnail.locator('img')).toHaveAttribute('aria-busy', 'false');
    const originalFrame = (await thumbnail.boundingBox())!;
    await page.route(
      /\/projects\/(everythingisfine\.jpg|atlas-globe-(desktop|phone)\.webp)$/,
      (route) => route.fulfill({ status: 404, body: 'Not found' }),
    );
    await page.reload();
    await project.scrollIntoViewIfNeeded();
    await expect(project.getByRole('status')).toContainText('Screenshot unavailable');
    await expect(project.locator('[aria-busy="true"]')).toHaveCount(0);
    await expect(
      project.getByRole('button', { name: 'Inspect screenshot: meanwhile.', exact: true }),
    ).toBeDisabled();
    const failedFrame = (await thumbnail.boundingBox())!;
    expect(failedFrame.width).toBeCloseTo(originalFrame.width, 0);
    expect(failedFrame.height).toBeCloseTo(originalFrame.height, 0);
    await project.getByRole('link', { name: 'Read the meanwhile. case study' }).click();
    await expect(page.getByRole('heading', { name: 'One quake. Two depths.' })).toBeVisible();
  });
}

test('reader keeps the current identity and named next project after scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#sec-work');
  const project = page.locator('#project-everythingisfine');
  await project
    .getByRole('button', { name: 'Inspect screenshot: meanwhile.', exact: true })
    .click();
  const viewer = page.getByRole('dialog', { name: 'meanwhile. screenshot', exact: true });
  const image = viewer.getByRole('img', {
    name: 'meanwhile. product interface, full screenshot',
  });
  await expect(image).toBeInViewport({ ratio: 0.99 });
  await expect(image).toHaveAttribute('src', '/projects/everythingisfine.jpg');
  await page.keyboard.press('Escape');
  const legacy = await page.evaluate(() => {
    location.hash = 'work/everythingisfine';
    return location.hash;
  });
  expect(legacy).toBe('#work/everythingisfine');
  const title = page.locator('#work-modal-title');
  const top = (await title.boundingBox())!.y;
  await page.locator('.story-scroll-area').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect((await title.boundingBox())!.y).toBeCloseTo(top, 1);
  await expect(
    page.locator('.work-story-ending').getByRole('link', { name: /Open meanwhile./ }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next case study', exact: true })).toHaveText(
    /Next: iodine/,
  );
  await page.getByRole('button', { name: 'Next case study', exact: true }).click();
  await expect(title).toContainText('iodine');
});
