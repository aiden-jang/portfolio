import { describe, expect, it, vi } from 'vitest';
import { CARS, SECTION_IDS } from '../config';
import { buildCommands, matchCommands, SECTION_LABELS } from './commands';

const build = () => buildCommands({ onSection: vi.fn(), setNotice: vi.fn() });

describe('buildCommands', () => {
  it('offers every section and every car', () => {
    const commands = build();
    for (const id of SECTION_IDS) {
      expect(
        commands.some((c) => c.id === id),
        `no command for ${id}`,
      ).toBe(true);
    }
    for (const [index, car] of CARS.entries()) {
      const command = commands.find((c) => c.id === `car-${index}`);
      expect(command, `no command for ${car.name}`).toBeDefined();
      expect(command!.label).toContain(car.name);
    }
  });

  it('gives every command a unique id, so the list cannot collide on keys', () => {
    const ids = build().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every command the label, hint and keywords the menu renders', () => {
    for (const command of build()) {
      expect(command.label, `${command.id} has no label`).toBeTruthy();
      expect(command.hint, `${command.id} has no hint`).toBeTruthy();
      expect(command.keywords, `${command.id} has no keywords`).toBeTruthy();
      expect(typeof command.run, `${command.id} has no action`).toBe('function');
    }
  });

  it('routes a section command to onSection with its own id', () => {
    const onSection = vi.fn();
    const commands = buildCommands({ onSection, setNotice: vi.fn() });
    commands.find((c) => c.id === 'sec-about')!.run();
    expect(onSection).toHaveBeenCalledWith('sec-about');
  });

  it('keeps the share command open, since it reports back into the menu', () => {
    const share = build().find((c) => c.id === 'share-garage');
    expect(share!.closeOnRun).toBe(false);
  });

  it('names every section it offers', () => {
    for (const id of SECTION_IDS) expect(SECTION_LABELS[id]).toBeTruthy();
  });
});

describe('matchCommands', () => {
  it('returns everything for an empty or whitespace query', () => {
    const commands = build();
    expect(matchCommands(commands, '')).toHaveLength(commands.length);
    expect(matchCommands(commands, '   ')).toHaveLength(commands.length);
  });

  it('matches on keywords the label never shows', () => {
    const hits = matchCommands(build(), 'rumble');
    expect(hits.map((c) => c.id)).toEqual(['rev']);
  });

  it('ignores case and surrounding space', () => {
    expect(matchCommands(build(), '  ReV ThE ENGINE ').map((c) => c.id)).toEqual(['rev']);
  });

  it('finds nothing for a query that matches nothing', () => {
    expect(matchCommands(build(), 'zzzznope')).toEqual([]);
  });
});
