import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => vi.unstubAllGlobals());
import { publicAnalyticsUrl } from './analytics';
it('strips arbitrary paths, scene settings, private query values and fragments', () => {
  expect(
    publicAnalyticsUrl({
      type: 'pageview',
      url: 'https://www.aidenjang.com/private-code?email=PRIVATE#PRIVATE',
    }),
  ).toEqual({ type: 'pageview', url: 'https://www.aidenjang.com/' });
  expect(
    publicAnalyticsUrl({
      type: 'vital',
      url: 'https://aidenjang.com/?car=2&paint=PRIVATE#contact',
    }),
  ).toEqual({ type: 'vital', url: 'https://aidenjang.com/' });
});
it('drops invalid URLs and other hosts', () => {
  expect(publicAnalyticsUrl({ url: 'not a url' })).toBeNull();
  expect(publicAnalyticsUrl({ url: 'https://other.test/PRIVATE' })).toBeNull();
});

it('honors explicit browser privacy choices for traffic and performance', () => {
  for (const preference of [{ globalPrivacyControl: true }, { doNotTrack: '1' }]) {
    vi.stubGlobal('navigator', preference);
    expect(publicAnalyticsUrl({ url: 'https://www.aidenjang.com/' })).toBeNull();
  }
});
