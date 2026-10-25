import { expect, type Page } from '@playwright/test';

export async function controlLayout(page: Page) {
  return page.evaluate(() => {
    const bar = document.querySelector(innerWidth < 768 ? '#mobile-bar' : '#desktop-dock')!;
    const targets = [
      bar,
      bar.querySelector('.car-choice')!,
      bar.querySelector('[aria-label^="Lighting:"]')!,
      bar.querySelector('[aria-label="All controls"]')!,
    ];
    return targets.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return [x, y, width, height].map((value) => Math.round(value * 100) / 100);
    });
  });
}

export async function expectControlLayout(page: Page, original: number[][]) {
  const current = await controlLayout(page);
  expect(current.length).toBe(original.length);
  for (let i = 0; i < current.length; i++)
    for (let axis = 0; axis < 4; axis++)
      expect(
        Math.abs(current[i][axis] - original[i][axis]),
        `control ${i}, coordinate ${axis} stays in place`,
      ).toBeLessThan(0.5);
}

export async function expectCompactControls(page: Page) {
  const gaps = await page.evaluate(() => {
    const bar = document.querySelector(innerWidth < 768 ? '#mobile-bar' : '#desktop-dock')!;
    const row =
      bar.querySelector('.car-control-buttons') ?? bar.querySelector('.car-controls-row')!;
    const controls = [...row.children]
      .filter(
        (element) =>
          element.matches('button') ||
          element.querySelector('button') ||
          element.textContent?.trim(),
      )
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0);
    return controls.flatMap((rect, index) => {
      const previous = controls[index - 1];
      return previous && Math.abs(previous.y - rect.y) < 2 ? [rect.x - previous.right] : [];
    });
  });
  expect(gaps.length).toBeGreaterThan(0);
  for (const gap of gaps)
    expect(gap, 'neighboring controls have no empty slot').toBeLessThanOrEqual(8);
}
