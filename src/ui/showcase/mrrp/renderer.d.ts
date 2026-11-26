import type { ComponentType } from 'react';

export type RoomAction = 'welcome' | 'pet' | 'mouse' | 'box' | 'sit';
export type RoomPositions = {
  center: number;
  picture: number;
  paper: [number, number, number, number];
  bean: [number, number];
  mouse: [number, number];
  box: [number, number];
};

export const Cat: ComponentType<{
  label: string;
  look: {
    name: string;
    fur: string;
    furDk: string;
    belly: string;
    eyes: string;
    tabby: boolean;
  };
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
  roomPlay: {
    action: { kind: RoomAction; count: number } | null;
    landing?: { current: number | null };
    print?: HTMLCanvasElement | null;
    onFirstFrame?: () => void;
    onPositions: (points: RoomPositions) => void;
    toy?: { current: { x: number; held: boolean } | null };
  };
}>;
