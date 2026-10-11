export function sectionProgress(y: number, starts: number[]): number {
  if (starts.length < 2) return 0;
  for (let i = 0; i < starts.length - 1; i++) {
    if (y < starts[i + 1]) {
      const fraction = Math.max(
        0,
        Math.min(1, (y - starts[i]) / Math.max(1, starts[i + 1] - starts[i])),
      );
      return (i + fraction) / (starts.length - 1);
    }
  }
  return 1;
}
