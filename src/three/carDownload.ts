import { create } from 'zustand';

export const useCarDownload = create(() => ({
  index: -1,
  percent: null as number | null,
}));

export function reportCarDownload(index: number, percent: number | null) {
  useCarDownload.setState((current) =>
    current.index === index && current.percent === percent ? current : { index, percent },
  );
}
