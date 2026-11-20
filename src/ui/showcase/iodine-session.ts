import { createContext } from 'react';

export type IodinePhase = 'edited' | 'restored';

export const IodineSession = createContext<{
  phase: IodinePhase;
  setPhase: (phase: IodinePhase) => void;
} | null>(null);
