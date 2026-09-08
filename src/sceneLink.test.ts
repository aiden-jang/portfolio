// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyCurrentSceneUrl, currentSceneUrl, shareCurrentScene } from './sceneLink';
import { useAppStore } from './store';

function visit(href: string): void {
  window.history.replaceState(null, '', href);
}

beforeEach(() => {
  visit('/');
  useAppStore.setState({ carIndex: 0, activeBodyColor: 'original', themeName: 'dusk' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('currentSceneUrl', () => {
  it('carries the whole garage: car, paint and lighting', () => {
    useAppStore.setState({ carIndex: 3, activeBodyColor: '#b00020', themeName: 'night' });

    const url = new URL(currentSceneUrl());

    expect(url.searchParams.get('car')).toBe('3');
    expect(url.searchParams.get('paint')).toBe('#b00020');
    expect(url.searchParams.get('light')).toBe('night');
  });

  it('keeps a case-study hash intact', () => {
    visit('/#work/iguess');

    expect(new URL(currentSceneUrl()).hash).toBe('#work/iguess');
  });

  it('keeps the ?clean screenshot mode intact', () => {
    visit('/?clean');

    expect(new URL(currentSceneUrl()).searchParams.has('clean')).toBe(true);
  });

  it('overwrites a stale garage rather than appending a second copy', () => {
    visit('/?car=5&paint=%23163a8a&light=night');
    useAppStore.setState({ carIndex: 1, activeBodyColor: 'original', themeName: 'dusk' });

    const url = new URL(currentSceneUrl());

    expect(url.searchParams.getAll('car')).toEqual(['1']);
    expect(url.searchParams.getAll('paint')).toEqual(['original']);
    expect(url.searchParams.getAll('light')).toEqual(['dusk']);
  });
});

describe('copyCurrentSceneUrl', () => {
  it('reports failure instead of throwing when the clipboard is blocked', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) },
    });

    await expect(copyCurrentSceneUrl()).resolves.toBe(false);
  });
});

describe('shareCurrentScene', () => {
  it('uses the share sheet when the platform has one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share, clipboard: { writeText: vi.fn() } });

    await expect(shareCurrentScene()).resolves.toBe('shared');
    expect(share).toHaveBeenCalledOnce();
  });

  it('treats a dismissed share sheet as no result, and does not fall back to copying', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')),
      clipboard: { writeText },
    });

    await expect(shareCurrentScene()).resolves.toBeNull();
    expect(writeText).not.toHaveBeenCalled();
  });

  it('falls back to copying when the share sheet fails for a real reason', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new DOMException('nope', 'NotAllowedError')),
      clipboard: { writeText },
    });

    await expect(shareCurrentScene()).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledOnce();
  });

  it('copies when the platform has no share sheet at all', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(shareCurrentScene()).resolves.toBe('copied');
  });
});
