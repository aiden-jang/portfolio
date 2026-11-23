import type { ComponentType } from 'react';

export const Cat: ComponentType<{
  label: string;
  look: { name: string; fur: string; furDk: string; belly: string; eyes: string; tabby: boolean };
  clock: { tz: string; homeHour: number };
  mood: null;
  nudge: number;
  reserveBelow: number;
  role: null;
  petAt: number | null;
  onPet: () => void;
  together: boolean;
  sitting: boolean;
  staying: boolean;
  satWith: boolean;
  spot: number | null;
}>;
