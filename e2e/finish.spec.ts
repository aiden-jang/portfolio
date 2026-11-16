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
    await page.goto('/');
    const dock = page.locator('#desktop-dock');
    await expect(dock).toBeVisible();
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(dock.getByRole('button', { name: /Browse cars\./ })).toBeVisible();
    await expect(dock.getByRole('button', { name: /Lighting:/ })).toBeVisible();
    await expect(dock.getByRole('button', { name: 'All controls', exact: true })).toBeVisible();
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
    await expect(page.getByText('Static preview · Your browser couldn’t start 3D.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Browse cars\./ })).toBeHidden();
    await expect(
      page.getByRole('img', { name: 'Static Ferrari F40 showroom preview' }),
    ).toBeVisible();
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
        .getByRole('button', { name: 'Lighting: Night. Switch to Dusk', exact: true })
        .filter({ visible: true }),
    ).toBeVisible();
  });

  test(`a failed screenshot settles honestly without changing its frame at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/projects/everythingisfine.jpg', (route) =>
      route.fulfill({ status: 404, body: 'Not found' }),
    );
    await page.goto('/#sec-work');
    const project = page.locator('#project-everythingisfine');
    await project.scrollIntoViewIfNeeded();
    await expect(project.getByRole('status')).toContainText('Screenshot unavailable');
    await expect(project.locator('[aria-busy="true"]')).toHaveCount(0);
    await expect(
      project.getByRole('button', { name: 'Inspect screenshot: everythingisfine', exact: true }),
    ).toBeDisabled();
    const frame = await project.locator('.preview-thumbnail').boundingBox();
    expect(frame!.width / frame!.height).toBeCloseTo(width < 768 ? 1.3 : 1.65, 1);
    await project
      .getByRole('button', { name: 'How I built it: everythingisfine', exact: true })
      .click();
    await expect(page.locator('#work-modal-title')).toContainText('everythingisfine');
  });
}

test('reader keeps the current identity and named next project after scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#sec-work');
  const project = page.locator('#project-everythingisfine');
  const inlineWidth = (await project.locator('.preview-thumbnail').boundingBox())!.width;
  await project
    .getByRole('button', { name: 'Inspect screenshot: everythingisfine', exact: true })
    .click();
  const viewer = page.getByRole('dialog', { name: 'everythingisfine screenshot', exact: true });
  expect((await viewer.locator('.preview-image').boundingBox())!.width).toBeGreaterThan(
    inlineWidth,
  );
  await page.keyboard.press('Escape');
  await project
    .getByRole('button', { name: 'How I built it: everythingisfine', exact: true })
    .click();
  const title = page.locator('#work-modal-title');
  const top = (await title.boundingBox())!.y;
  await page.locator('.story-scroll-area').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect((await title.boundingBox())!.y).toBeCloseTo(top, 1);
  await expect(
    page.locator('.work-story-ending').getByRole('link', { name: /Open everythingisfine/ }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next case study', exact: true })).toHaveText(
    /Next: iodine/,
  );
  await page.getByRole('button', { name: 'Next case study', exact: true }).click();
  await expect(title).toContainText('iodine');
});
