import { createContext, type MouseEvent } from 'react';

export type IodinePhase = 'edited' | 'restored';

export const IodineSession = createContext<{
  phase: IodinePhase;
  setPhase: (phase: IodinePhase) => void;
} | null>(null);

export const OpenIodine = createContext<
  ((event: MouseEvent<HTMLAnchorElement>, restored: boolean) => boolean) | null
>(null);
